import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../context/UserContext';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import Select from 'react-select';



// Reusable InputField with memoization
const InputField = React.memo(({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="mb-4 p-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  </div>
));

// Simple display block
const Display = ({ label, value }: { label: string; value: string }) => (
  <div className="mb-4 p-2">
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="mt-1 text-sm text-gray-900">{value || '-'}</p>
  </div>
);

const ProfileInterviewer: React.FC = () => {
  const { user, login } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewerData, setInterviewerData] = useState<any>(null);

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

  const skillOptions = skillSet.map(skill => ({
    label: skill,
    value: skill
  }));

  const fetchInterviewerProfile = async () => {
    try {
      const q = query(
        collection(db, "interviewer_Users"),
        where("email", "==", user?.email)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setInterviewerData(snapshot.docs[0].data());
      }
    } catch (err) {
      console.error('Error fetching interviewer data:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'interviewer') {
      fetchInterviewerProfile();
    }
  }, [user]);

  const handleChange = useCallback((field: string, value: string | string[]) => {
    setInterviewerData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !interviewerData) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, "interviewer_Users"),
        where("email", "==", user.email)
      );
      const snapshot = await getDocs(q);
      const docRef = snapshot.docs[0].ref;

      await updateDoc(docRef, {
        fullName: interviewerData.fullName,
        email: interviewerData.email,
        phone: interviewerData.phone,
        address: interviewerData.address,
        linkedIn: interviewerData.linkedIn,
        github: interviewerData.github,
        currCompany: interviewerData.currCompany,
        prevCompanies: interviewerData.prevCompanies,
        techSkills: interviewerData.techSkills,
        upiID: interviewerData.upiID,
      });

      login({ ...user, name: interviewerData.fullName });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Profile Overview</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {user.role === 'interviewer' && interviewerData ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Basic Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Full Name" value={interviewerData.fullName || ''} onChange={(val) => handleChange('fullName', val)} />
                    <InputField label="Phone" value={interviewerData.phone || ''} onChange={(val) => handleChange('phone', val)} />
                    <InputField label="Address" value={interviewerData.address || ''} onChange={(val) => handleChange('address', val)} />
                    <InputField label="UPI ID" value={interviewerData.upiID || ''} onChange={(val) => handleChange('upiID', val)} />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-2">Professional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Current Company" value={interviewerData.currCompany || ''} onChange={(val) => handleChange('currCompany', val)} />
                    <InputField
                      label="Previous Companies (comma-separated)"
                      value={interviewerData.prevCompanies?.join(', ') || ''}
                      onChange={(val) => handleChange('prevCompanies', val.split(',').map(v => v.trim()))}
                    />
                    {/* <InputField
                      label="Tech Skills (comma-separated)"
                      value={interviewerData.techSkills?.join(', ') || ''}
                      onChange={(val) => handleChange('techSkills', val.split(',').map(v => v.trim()))}
                    /> */}
                    <div className="mb-4">
                      <label htmlFor="techSkills" className="block text-sm font-medium text-gray-700 mb-1">
                        Tech Skills
                      </label>
                      <Select
                        id="techSkills"
                        isMulti
                        options={skillOptions}
                        value={skillOptions.filter(option => interviewerData.techSkills?.includes(option.value))}
                        onChange={(selectedOptions) => {
                          handleChange('techSkills', selectedOptions.map(option => option.value));
                        }}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Type or select your skills..."
                      />
                    </div>

                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-2">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="LinkedIn" value={interviewerData.linkedIn || ''} onChange={(val) => handleChange('linkedIn', val)} />
                    <InputField label="GitHub" value={interviewerData.github || ''} onChange={(val) => handleChange('github', val)} />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Name" value={user.name} onChange={(val) => handleChange('name', val)} />
                  <InputField label="Email" value={user.email} onChange={(val) => handleChange('email', val)} />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </form>
          ) : (
            <div className="space-y-8">
              {user.role === 'interviewer' && interviewerData ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Display label="Full Name" value={interviewerData.fullName} />
                      <Display label="Phone" value={interviewerData.phone} />
                      <Display label="Address" value={interviewerData.address} />
                      <Display label="UPI ID" value={interviewerData.upiID} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Display label="Current Company" value={interviewerData.currCompany} />
                      <Display label="Previous Companies" value={interviewerData.prevCompanies?.join(', ')} />
                      <Display label="Tech Skills" value={interviewerData.techSkills?.join(', ')} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Display label="LinkedIn" value={interviewerData.linkedIn} />
                      <Display label="GitHub" value={interviewerData.github} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Display label="Name" value={user.name} />
                  <Display label="Email" value={user.email} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default ProfileInterviewer;
