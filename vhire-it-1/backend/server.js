const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require("axios");
const nodemailer = require('nodemailer');
const validator = require("validator");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// --- Existing Code ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const ONE_COMPILER_API = process.env.ONE_COMPILER_API_URL;
const API_HEADERS = {
  "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
  "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
  "Content-Type": "application/json",
};

const roomCodes = {};
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    if (roomCodes[roomId]) {
      socket.emit("codeChange", roomCodes[roomId]);
    }
  });

  socket.on("codeChange", ({ roomId, code }) => {
    roomCodes[roomId] = code;
    socket.to(roomId).emit("codeChange", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.post("/run", async (req, res) => {
  try {
    const { language, code } = req.body;
    const fileExtensions = {
      cpp: "main.cpp",
      python: "main.py",
      java: "Main.java",
      javascript: "main.js",
    };
    const filename = fileExtensions[language] || "main.txt";

    const payload = {
      language,
      stdin: "",
      files: [{ name: filename, content: code }],
    };

    const response = await axios.post(ONE_COMPILER_API, payload, {
      headers: API_HEADERS,
    });

    res.json({ output: response.data.stdout || response.data.stderr });
  } catch (error) {
    console.error("Execution Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error executing code" });
  }
});

app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: error.message || error.toString(),
    });
  }
});

// --- Razorpay + Firebase ---
const Razorpay = require('razorpay');
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});
const db = admin.firestore();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.post('/create-payment-link', async (req, res) => {
  const { upiId, amount, name, email, interviewId } = req.body;
  try {
    const link = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: 'INR',
      accept_partial: false,
      description: `Payment for Interview - ${name}`,
      customer: { name, email },
      reminder_enable: true,
      callback_url: `http://localhost:3000/payment-success?email=${email}&interviewId=${interviewId}`,
      callback_method: 'get',
    });
    console.log("Payment link created:", link.id);
    const snapshot = await db.collection('interviewer_payment_info').where('Interview_id', '==', interviewId).get();
  
  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref; // Assuming only one doc per email
    await docRef.set({
      interviewer_email_id: email,
      upid_id: upiId,
      Interview_id: interviewId,
      payment_info: link.short_url,
      payment_id: link.id,
      payment_status: 'pending',
    }, { merge: true });
  } else {
    console.log('No document found for this email.');
  }
  

    res.json({ short_url: link.short_url });
  } catch (err) {
    console.error('Payment link error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/check-payment-status', async (req, res) => {
  const { email, interviewId } = req.query;

  try {
    const snapshot = await db.collection('interviewer_payment_info')
      .where('Interview_id', '==', interviewId)
      .get();

    if (snapshot.empty) return res.status(404).send('No record found.');

    const doc = snapshot.docs[0];
    const paymentInfo = doc.data();
    const docRef = doc.ref;

    const paymentLinkId = paymentInfo.payment_id;
    console.log("link at server", paymentLinkId);

    const razorResponse = await razorpay.paymentLink.fetch(paymentLinkId);

    if (razorResponse.status === 'paid') {
      await docRef.update({
        payment_status: 'received',
      });
      return res.send('✅ Payment verified and recorded in Firebase.');
    } else {
      return res.send('⚠️ Payment is still pending.');
    }
  } catch (err) {
    console.error('Check payment error:', err);
    res.status(500).send('Error verifying payment.');
  }
});



//sending welcome emails.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // your Gmail address
    pass: process.env.EMAIL_PASS        // your Gmail App Password
  }
});

app.post('/send-welcome-emails', async (req, res) => {
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails)) {
    return res.status(400).json({ error: 'Invalid email list' });
  }

  try {
    for (const email of emails) {
      console.log("Checking email:", email);
  
      // Skip invalid emails
      if (!validator.isEmail(email)) {
        console.warn("Invalid email skipped:", email);
        continue;
      }
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to VHire Platform!',
        html: `
          <p>Dear Candidate,</p>
          <p>We are excited to have you onboard for the interview process.</p>
          <p>Please <a href="https://vhire.vercel.app/register" target="_blank">register</a> on our VHire platform to proceed with interviews and receive further notifications.</p>
          <br/>
          <p>Regards,<br/>VHire Team</p>
        `
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${email}`);
    }
  
    res.status(200).json({ message: 'Emails sent successfully' });
    console.log("All valid emails processed successfully");
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

// POST /api/sendInterviewScheduledEmail
app.post("/api/sendInterviewScheduledEmail", async (req, res) => {
  const { email, date, time, interviewer } = req.body;

  const mailOptions = {
    from: `"VHire Interviews" <${process.env.EMAIL_ID}>`,
    to: email,
    subject: "Your Interview is Scheduled",
    html: `
      <p>Dear Candidate,</p>
      <p>We are pleased to inform you that your interview has been scheduled.
      </p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Interviewer:</strong> ${interviewer}</li>
      </ul>
      <p>Please be available at least 10 minutes prior to the scheduled time and ensure you have a stable internet connection and a quiet environment. Further details regarding the interview platform and room link will be shared with you shortly. We appreciate your interest in the position and look forward to your participation in the upcoming interview.</p>
      <p>Best of luck! </p>
      <p>- VHire Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent");
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).send("Failed to send email");
  }
});

// --- Start Server ---
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
