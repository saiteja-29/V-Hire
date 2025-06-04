import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { X } from "lucide-react";
import { stringify } from "node:querystring";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

interface SuggestedInterviews {
  companyName: string;
  interview_id: string;
  interview_status: string;
  jobDesc: string;
  pointers: string;
  role: string;
  recruitment_id: string;
  skills: string[];
  deadline: string;
  candidateEmail: string;
}

const ScheduleInterview = () => {
  const { recruitmentId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [interviewData, setInterviewData] = useState<SuggestedInterviews[] | null>(null);
  const [remainingCandidates, setRemainingCandidates] = useState(0);
  const [selectedCount, setSelectedCount] = useState<number>(1);
  const [schedules, setSchedules] = useState<
  {
    interview_id: string;
    recruitment_id: string;
    email: string;
    date: string;
    time: string;
  }[]
  >([]);
  const navigate = useNavigate();
  const { user } = useUser();

  const fetchInterview = async () => {
    if (!recruitmentId) return;
    try {
      const q = query(
        collection(db, "interviews"),
        where("interview_status", "==", "not scheduled"),
        where("recruitment_id", "==", recruitmentId)
      )
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs;
        setRemainingCandidates(doc.length);
        const data = snapshot.docs
          .map(doc => ({ ...(doc.data() as SuggestedInterviews) }))
        // console.log(data);
        const formattedData: SuggestedInterviews[] = data.map(doc => ({
          companyName: doc.companyName,
          interview_id: doc.interview_id,
          interview_status: doc.interview_status,
          jobDesc: doc.jobDesc,
          pointers: doc.pointers,
          role: doc.role,
          recruitment_id: doc.recruitment_id,
          skills: doc.skills,
          deadline: doc.deadline,
          candidateEmail: doc.candidateEmail,
        }));

        // console.log(formattedData);

        setInterviewData(formattedData);


      };
    } catch (err) {
      console.error("Error fetching interview data:", err);
    }
  };
  useEffect(() => {
    fetchInterview();
  }, [recruitmentId]);

  // const isValidSchedule = () => {
  //   if (!interviewData) return false;
  //   return interviewData.slice(0, selectedCount).every((candidate, index) => {
  //     const entry = schedules[index];
  //     if (!entry || !entry.date || !entry.time) return false;
  //     const deadline = new Date(candidate.deadline);
  //     const selected = new Date(`${entry.date}T${entry.time}`);
  //     return selected < deadline;
  //   });
  // };

  const handleScheduleChange = (
    index: number,
    field: "date" | "time",
    value: string
  ) => {
    setSchedules((prev) => {
      if (!interviewData) return prev;
      const updated = [...prev];
      const candidate = interviewData[index];
      const deadline = new Date(candidate.deadline);
      const existing = updated[index] || {
        interview_id: candidate.interview_id,
        recruitment_id: candidate.recruitment_id,
        email: candidate.candidateEmail,
      };

      updated[index] = {
        ...existing,
        [field]: value,
      };

      return updated;
    });
  };

  const handleSubmit = async () => {
    console.log("Scheduled Candidates:", schedules);
    if (!schedules) {
      //popup code
      console.log("scheduled data not found");

    }

    // console.log(isValidSchedule());


    // if (!isValidSchedule()) {
    //   alert("Please ensure all dates and times are filled and valid.");
    //   return;
    // }

    schedules.map(async (schedule) => {
      console.log(schedule);
      if (!recruitmentId) {
        console.error("Recruitment ID is undefined.");
        return; // Exit the function if recruitmentId is not available
      }

      try {
        const q = query(
          collection(db, "interviews"),
          where("interview_id", "==", schedule.interview_id)
        );
        const querySnapshot = await getDocs(q);
        const combinedDateTime = `${schedule.date} at ${schedule.time}`.toString();
        const generatedRoomId = Math.random().toString(36).substring(2, 9);

        const updatePromises = querySnapshot.docs.map((document) => {
          const docRef = doc(db, "interviews", document.id);
          return updateDoc(docRef, {
            interview_status: "scheduled",
            timing: combinedDateTime,
            interviewerEmail: user?.email,
            roomId: generatedRoomId,
          });
        });

        // Step 3: Wait for all updates to complete
        await Promise.all(updatePromises);
        console.log("All matching interviews updated.");

        // Send email to the candidate
        const emailResponse = await fetch("http://localhost:5001/api/sendInterviewScheduledEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: schedule.email,
            date: schedule.date,
            time: schedule.time,
            interviewer: user?.email,
            // roomId: generatedRoomId,
          }),
        });

        if (!emailResponse.ok) {
          console.error(`Failed to send email to ${schedule.email}`);
        } else {
          console.log(`Email sent to ${schedule.email}`);
        }

      } catch (error) {
        console.log(error);

      }

    })



    setIsOpen(false);

  };


  if (!interviewData) {
    return <div className="text-gray-600 p-4">Loading interview info...</div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-white space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{interviewData[0].companyName}</p>
        <p className="text-sm text-gray-600">{remainingCandidates} candidates are yet to be scheduled</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-800">Job Description</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{interviewData[0].jobDesc}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-800">Skills Required</h3>
        <div className="flex flex-wrap gap-2">
          {interviewData[0].skills.map((skill) => (
            <span
              key={skill}
              className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Select number of candidates for interview
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedCount((prev) => Math.max(1, prev - 1))
              }
              className="px-2 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
              disabled={selectedCount <= 1}
            >
          
            </button>

            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={Math.min(remainingCandidates, 5)}
              value={selectedCount}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= Math.min(remainingCandidates, 5)) {
                  setSelectedCount(value);
                }
              }}
              className="w-16 text-center border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <button
              type="button"
              onClick={() =>
                setSelectedCount((prev) =>
                  Math.min(Math.min(remainingCandidates, 5), prev + 1)
                )
              }
              className="px-2 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
              disabled={selectedCount >= Math.min(remainingCandidates, 5)}
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500">
            You can select up to {Math.min(remainingCandidates, 5)} candidates
          </p>
        </div>


        <button
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors w-fit"
          onClick={() => setIsOpen(true)}
        >
          Select and Schedule
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="relative bg-white border border-gray-300 p-6 rounded-2xl w-[480px] max-h-[90vh] overflow-y-auto shadow-xl space-y-5 animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Schedule Candidates</h2>
              <p className="text-sm text-gray-600">You can select up to {selectedCount} candidates.</p>
            </div>

            {interviewData.slice(0, selectedCount).map((candidate, index) => (
              <div key={index} className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium text-gray-800">{candidate.candidateEmail}</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    max={new Date(candidate.deadline).toISOString().split("T")[0]}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onChange={(e) =>
                      handleScheduleChange(index, "date", e.target.value)
                    }
                  />

                  <input
                    type="time"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onChange={(e) =>
                      handleScheduleChange(index, "time", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowConfirm(true)}
                className={`px-4 py-2 rounded transition text-white bg-blue-600 hover:bg-blue-700`}
                
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[360px] space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 text-center">Confirm Scheduling</h3>
            <p className="text-sm text-gray-600 text-center">
              Are you sure you want to schedule these interviews?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleSubmit();
                  setShowConfirm(false);
                  setShowSuccess(true);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[360px] space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-green-700 text-center">Success!</h3>
            <p className="text-sm text-gray-600 text-center">
              Interviews have been successfully scheduled.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
};

export default ScheduleInterview;
