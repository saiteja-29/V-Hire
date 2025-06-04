import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { db } from '../../config/firebaseConfig';
import { useUser } from '../../context/UserContext';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';


const DashboardCompany: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [candidateEmails, setCandidateEmails] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [isOpen, setIsopen] = useState<Boolean>(false);
  const [companyName, setCompanyName] = useState<string>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    role: '',
    interviewStatus: '',
    rating: ''
  });
  const skillSet = [
    // Programming Languages
    'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C#', 'Swift', 'Kotlin', 'Ruby',

    // Frontend
    'React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'Tailwind CSS', 'Next.js', 'Redux', 'SASS', 'Webpack',

    // Backend
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'GraphQL', 'REST APIs', 'gRPC',

    // Mobile Development
    'React Native', 'Flutter', 'Swift (iOS)', 'Kotlin (Android)',

    // DevOps & Infrastructure
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud Platform (GCP)', 'CI/CD', 'Terraform', 'Linux', 'Nginx',

    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'DynamoDB', 'Cassandra',

    // Testing
    'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'JUnit', 'Testing Library',

    // Data/AI/ML
    'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'OpenCV', 'Hugging Face Transformers', 'Matplotlib', 'SQL',

    // Tools & Misc
    'Git', 'GitHub', 'GitLab', 'VS Code', 'Postman', 'Figma', 'Agile', 'Scrum', 'Jira',

    // System Design & Architecture
    'System Design', 'Microservices', 'Event-Driven Architecture', 'Message Queues (Kafka, RabbitMQ)',

    // Security
    'OAuth2', 'JWT', 'OWASP', 'TLS/SSL', 'Penetration Testing',

    // Web/App Dev Tags (for broad category)
    'WebDev', 'AppDev', 'Full Stack', 'Frontend', 'Backend'
  ];
  const [formValues, setFormValues] = useState({
    role: '',
    deadline: '',
    jobDesc: '',
    skills: '',
    pointers: ''
  });
  const { user, login } = useUser();
  const getCompanyNameByEmail = async () => {
    if (!user) {
      console.log("user not present")
      return;
    }
    try {
      const companyRef = collection(db, 'company_users');
      const querySnapshot = await getDocs(query(companyRef, where("email", "==", user?.email)));
      const companyDoc = querySnapshot.docs[0];
      companyDoc ? setCompanyName(companyDoc.data().companyName) : setCompanyName("Company 1");
      console.log("company name set");
    } catch (error) {
      console.log("could not able to get company name")
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const data = results.data
          .slice(1)
          .map((row: any) => String(Object.values(row)[0])) // Ensure type is string
          .filter((value) => Boolean(value));
        setCandidateEmails(data);
      },
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const sendWelcomeEmails = async (emails: string[]) => {
    try {
      const response = await fetch('http://localhost:5001/send-welcome-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Welcome emails sent successfully.");
      } else {
        console.error("Error sending emails:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmitToDatabase = async () => {
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    try {
      if (!companyName || !formValues.role || !formValues.deadline || !formValues.jobDesc || !formValues.skills || !formValues.pointers) {
        console.log(companyName);
        console.log(formValues);

        alert("All form fields are required.");
        setIsSubmitting(false);
        return;
      }

      const recruitmentId = uuidv4();
      const interviewsRef = collection(db, 'interviews');

      for (const email of candidateEmails) {
        const interviewData = {
          candidateEmail: email,
          jobDesc: formValues.jobDesc,
          role: formValues.role,
          skills: formValues.skills.split(',').map(skill => skill.trim()),
          pointers: formValues.pointers,
          deadline: formValues.deadline,
          companyName: companyName,
          interview_id: uuidv4(),
          recruitment_id: recruitmentId,
          interviewerEmail: '',
          timing: '',
          roomId: '',
          interview_status: 'not scheduled',
          verifiedCandidateEmail: '',
          verifiedInterviewerEmail: ''
        };
        await addDoc(interviewsRef, interviewData);
      }
      await sendWelcomeEmails(candidateEmails);
      setCandidateEmails([]);
      setSelectedFileName('');
      setFormValues({ role: '', deadline: '', jobDesc: '', skills: '', pointers: '' });
      fetchInterviews();
      navigate('/dashboard');
      setIsopen(false);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  const fetchInterviews = async () => {
    const interviewsRef = collection(db, 'interviews');
    if (!companyName) {
      console.error('No company found for this email.');
      return;
    }

    const q = query(interviewsRef, where("companyName", "==", companyName));
    const querySnapshot = await getDocs(q);

    const interviewsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const interview = doc.data();
      const interviewId = interview.interview_id;
      const interviewStatus = interview.interview_status;

      // Check if interview status is eligible for fetching report
      if (interviewStatus === "completed") {
        const reportRef = collection(db, 'interview_report');
        const reportQuery = query(reportRef, where("interview_id", "==", interviewId));
        const reportSnapshot = await getDocs(reportQuery);

        let reportData = {
          verdict: "NA",
          status: "NA",
          rating: "NA"
        };

        if (!reportSnapshot.empty) {
          const reportDoc = reportSnapshot.docs[0].data(); // assuming one-to-one mapping
          reportData = {
            verdict: reportDoc.verdict || "NA",
            status: reportDoc.status || "NA",
            rating: reportDoc.rating || "NA",
          };
        }

        return {
          ...interview,
          ...reportData
        };
      } else {
        return {
          ...interview,
          verdict: "NA",
          status: "NA",
          rating: "NA"
        };
      }
    }));

    setInterviews(interviewsData);
  };
  const downloadInterviewDetails = (interview: any) => {
    const content = Object.entries(interview)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${interview.candidateEmail}_interview.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredInterviews = interviews.filter(interview => {
    const roleMatch = filters.role === '' || interview.role.toLowerCase().includes(filters.role.toLowerCase());
    const statusMatch = filters.interviewStatus === '' || interview.interview_status === filters.interviewStatus;
    const ratingMatch = filters.rating === '' || interview.rating === filters.rating;

    return roleMatch && statusMatch && ratingMatch;
  });

  const downloadTableAsCSV = () => {
    const headers = ['Candidate Email', 'Role', 'Deadline', 'Interview Status', 'Status', 'Verdict', 'Rating'];
    const rows = filteredInterviews.map(interview => [
      interview.candidateEmail,
      interview.role,
      interview.deadline,
      interview.interview_status,
      interview.status,
      interview.verdict,
      interview.rating
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'interviews.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };




  useEffect(() => {
    if (user) {
      getCompanyNameByEmail();
      console.log(companyName);
    }
  }, [user]);

  useEffect(() => {
    if (companyName) {
      fetchInterviews();
    }
  }, [companyName])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome {companyName}</h1>

      <button
        onClick={() => {
          setIsopen(true);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
      >
        Request for Interview
      </button>

      {
        isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
            <div className="relative bg-white w-full max-w-4xl p-8 rounded-2xl shadow-xl space-y-6 animate-fade-in max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setIsopen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition text-2xl"
                aria-label="Close modal"
              >
                &times;
              </button>

              {/* Modal Title */}
              <h2 className="text-2xl font-bold mb-2">Create New Interview</h2>

              {/* CSV Upload */}
              <div className="flex items-center gap-4 mb-6">
                <label
                  htmlFor="csvUpload"
                  className="cursor-pointer bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition"
                >
                  📄 Upload Candidate CSV
                </label>
                <input
                  id="csvUpload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {selectedFileName && (
                  <span className="text-gray-700 text-sm">{selectedFileName}</span>
                )}
              </div>

              {/* Form Fields */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitToDatabase();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      name="role"
                      value={formValues.role}
                      onChange={handleFormChange}
                      placeholder="e.g. Frontend Developer"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      name="deadline"
                      type="date"
                      value={formValues.deadline}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                    <textarea
                      name="jobDesc"
                      value={formValues.jobDesc}
                      onChange={handleFormChange}
                      placeholder="Write a detailed job description..."
                      className="w-full p-2 border rounded h-24"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required</label>
                    <Select
                      isMulti
                      options={skillSet.map(skill => ({ label: skill, value: skill }))}
                      value={formValues.skills
                        ? formValues.skills.split(',').map(s => ({
                          label: s.trim(),
                          value: s.trim()
                        }))
                        : []}
                      onChange={(selectedOptions) => {
                        const selectedSkills = selectedOptions.map(option => option.value).join(', ');
                        setFormValues(prev => ({ ...prev, skills: selectedSkills }));
                      }}
                      placeholder="Select relevant skills"
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pointers</label>
                    <input
                      name="pointers"
                      value={formValues.pointers}
                      onChange={handleFormChange}
                      placeholder="e.g. Assessment notes or interview guidelines"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                {/* Preview Toggle */}
                {(candidateEmails.length > 0 || formValues.role || formValues.jobDesc) && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(prev => !prev)}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mb-6"
                  >
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </button>
                )}

                {/* Preview Section */}
                {showPreview && candidateEmails.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Candidate Emails</h3>
                    <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
                      {candidateEmails.map((email, index) => (
                        <li key={index}>{email}</li>
                      ))}
                    </ul>

                    <div className="bg-gray-100 p-4 rounded space-y-2 text-sm">
                      <p><strong>Role:</strong> {formValues.role}</p>
                      <p><strong>Deadline:</strong> {formValues.deadline}</p>
                      <p><strong>Job Description:</strong> {formValues.jobDesc}</p>
                      <p><strong>Skills Required:</strong> {formValues.skills}</p>
                      <p><strong>Pointers:</strong> {formValues.pointers}</p>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="text-right">
                  <button
                    type="submit" // Ensure this is a submit button
                    className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting} // Disable button when submitting
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit to Vhire'} {/* Change button text based on loading state */}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }



      <div className="mt-6">
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            placeholder="Filter by Role"
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="interviewStatus"
            value={filters.interviewStatus}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Interviews</option>
            <option value="not scheduled">Not Scheduled</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
          <select
            name="rating"
            value={filters.rating}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="NA">NA</option>
          </select>
          <button
            onClick={downloadTableAsCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm"
          >
            📥 Download data as CSV
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Interviews List</h2>

        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className="text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-3 border-b">Candidate Email</th>
                <th className="px-4 py-3 border-b">Role</th>
                <th className="px-4 py-3 border-b">Deadline</th>
                <th className="px-4 py-3 border-b">Interview Status</th>
                <th className="px-4 py-3 border-b">Status</th>
                <th className="px-4 py-3 border-b">Verdict</th>
                <th className="px-4 py-3 border-b">Rating</th>
                {/* <th className="px-4 py-3 border-b">Download</th> */}
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {filteredInterviews.map((interview, index) => (
                <tr
                  key={index}
                  className={`transition hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-4 py-2 border-b">{interview.candidateEmail}</td>
                  <td className="px-4 py-2 border-b">{interview.role}</td>
                  <td className="px-4 py-2 border-b">{interview.deadline}</td>
                  <td className="px-4 py-2 border-b">{interview.interview_status}</td>
                  <td className="px-4 py-2 border-b">{interview.status}</td>
                  <td className="px-4 py-2 border-b">{interview.verdict}</td>
                  <td className="px-4 py-2 border-b">{interview.rating}</td>
                  {/* <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => downloadInterviewDetails(interview)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs font-medium shadow-sm"
                    >
                      Download
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default DashboardCompany;
