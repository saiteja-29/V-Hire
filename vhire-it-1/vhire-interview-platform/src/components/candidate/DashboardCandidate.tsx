import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useUser } from '../../context/UserContext';

// interface Interview {
//   id: string;
//   interviewerEmail: string;
//   candidateEmail: string;
//   interviewType: string;
//   exactTiming: string;
//   roomId: string;
// }

interface UpcomingInterviews {
  companyName: string,
  interview_id: string,
  interview_status: string,
  jobDesc: string,
  pointers: string,
  role: string,
  recruitment_id: string,
  skills: string[],
  deadline: string,
  roomId: string,
  candidateEmail: string,
  timing: string,
}

const DashboardCandidate: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const { user } = useUser();
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterviews[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<UpcomingInterviews | null>(null);

  const fetchInterviews = async () => {
    try {
      const q = query(
        collection(db, "interviews"),
        where("candidateEmail", "==", user?.email),
        where("interview_status", "==", "scheduled")
      )
      const snapshots = await getDocs(q);

      const data: UpcomingInterviews[] = snapshots.docs.map((doc) => {
        const d = doc.data();
        // const formatedTiming = formatTimestamp(d.timing.toString())
        return {
          companyName: d.companyName || "",
          interview_id: doc.id,
          interview_status: d.interview_status || "",
          jobDesc: d.jobDesc || "",
          pointers: d.pointers || "",
          role: d.role || "",
          recruitment_id: d.recruitment_id || "",
          skills: d.skills || [],
          deadline: d.deadline || "",
          roomId: d.roomId || "",
          candidateEmail: d.candidateEmail || "",
          timing: d.timing || ""
        };
      });
      console.log(data);
      setUpcomingInterviews(data);

    } catch (error) {
      console.error('Error fetching interviews: ', error);
    }
  };
  useEffect(() => {
    if (user) fetchInterviews();
  }, [user]);

  const handleJoinMeet = () => {
    if (selectedInterview && user && user.email === selectedInterview.candidateEmail) {
      console.log(selectedInterview);
      navigate(
        `room/${selectedInterview.roomId}?type=one-on-one&name=${encodeURIComponent(user.name)}`
      );
    }
  };

  const handleUrgentJoinMeet = () => {
    if (user) {
      navigate(
        `room/${roomId}?type=one-on-one&name=${encodeURIComponent(name)}`
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-gray-900">Welcome {user?.name}</h1>
          <p className="mt-2 text-lg text-gray-600">Manage and join your interviews</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join Interview Now</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                  Room ID
                </label>
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <button
                onClick={handleUrgentJoinMeet}
                disabled={!name.trim() || !roomId.trim()}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Join Interview
              </button>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Interviews</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingInterviews.length ? (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <button
                      key={interview.interview_id}
                      onClick={() => setSelectedInterview(interview)}
                      className="w-full text-left rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {interview.companyName}
                          </h3>
                          <p className="text-sm text-gray-700">
                            Candidate: <span className="font-medium">{interview.candidateEmail}</span>
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                            {interview.timing}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming interviews scheduled.</p>
              )}
            </div>
          </section>
        </div>

        {selectedInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
            <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl space-y-4 relative">
              <button
                onClick={() => setSelectedInterview(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold text-gray-900">Interview Details</h2>
              <p><strong>Company:</strong> {selectedInterview.companyName}</p>
              <p><strong>Candidate:</strong> {selectedInterview.candidateEmail}</p>
              <p><strong>Role:</strong> {selectedInterview.role}</p>
              {/* <p><strong>Status:</strong> {selectedInterview.interview_status}</p> */}
              {/* <p><strong>Skills:</strong> {selectedInterview.skills.join(", ")}</p> */}
              <p><strong>Job Description:</strong> {selectedInterview.jobDesc}</p>
              <p><strong>Timing:</strong> {selectedInterview.timing}</p>

              <button
                onClick={handleJoinMeet}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Join Interview
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default DashboardCandidate;
