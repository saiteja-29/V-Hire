import React, { useState } from 'react';
import { db } from '../../config/firebaseConfig'; // Firebase config
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '../../context/UserContext';
import AuthService from '../../services/auth.service';
import Select from 'react-select';
import { useNavigate } from "react-router-dom";


const ProfileFormInterviewer: React.FC = () => {

    const { user, login } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // skill set fixed list
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


    const [fullName, setFullName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [linkedIn, setLinkedIn] = useState('');
    const [github, setGithub] = useState('');
    const [currCompany, setCurrCompany] = useState('');
    const [upiID, setUpiID] = useState('');
    const [prevCompanies, setPrevCompanies] = useState<string[]>([]);
    const [techSkills, setTechSkills] = useState<string[]>([]);
    const skillOptions = skillSet.map(skill => ({ value: skill, label: skill }));

    type TechSkillsSelectProps = {
        techSkills: string[];
        setTechSkills: (skills: string[]) => void;
    };



    const navigate = useNavigate();



    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that all required fields are filled
        if (!fullName || !phone || !address || !currCompany || techSkills.length === 0) {
            alert('Please fill in all required fields.');
            return;
        }

        const interviewref = collection(db, 'interviewer_Users');
        const q = query(interviewref, where('email', '==', email));
        // Prepare data to store
        try {
            // Add data to Firestore
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // interviewer profile already exists
                alert('A profile with this same email is registered, please login using some other mail');
                return;
            }
            const interviewerData = {
                fullName,
                email,
                phone,
                address,
                linkedIn,
                github,
                currCompany,
                prevCompanies,
                techSkills,
                upiID
            };
            const interviewref = collection(db, 'interviewer_Users');
            await addDoc(interviewref, interviewerData);
            alert('Interviewer profile registration successful!');
            navigate("/dashboard");
        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Error occurred during registration');
        }
    };


    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Complete your Interviewer profile</h2>

            <div className="mb-4">
                <label htmlFor="FullName" className="block text-sm font-medium">Full Name</label>
                <input
                    type="text"
                    id="companyName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="Phone" className="block text-sm font-medium">Phone</label>
                <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="Address" className="block text-sm font-medium">Address</label>
                <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="LinkedIn" className="block text-sm font-medium">LinkedIn</label>
                <input
                    type="text"
                    id="linkedIn"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="GitHub" className="block text-sm font-medium">GitHub</label>
                <input
                    type="text"
                    id="github"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="upiID" className="block text-sm font-medium">UPI ID</label>
                <input
                    type="text"
                    id="upiID"
                    value={upiID}
                    onChange={(e) => setUpiID(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="CurrCompany" className="block text-sm font-medium">Current Company</label>
                <input
                    type="text"
                    id="currCompany"
                    value={currCompany}
                    onChange={(e) => setCurrCompany(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="PrevCompanies" className="block text-sm font-medium">Previous Companies</label>
                <input
                    type="text"
                    id="prevCompanies"
                    value={prevCompanies.join(', ')}
                    onChange={(e) => setPrevCompanies(e.target.value.split(',').map(company => company.trim()))}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="TechSkills" className="block text-sm font-medium text-gray-700 mb-1">
                    Tech Skills
                </label>
                <Select
                    id="techSkills"
                    isMulti
                    options={skillOptions}
                    value={skillOptions.filter(option => techSkills.includes(option.value))}
                    onChange={(selectedOptions) => {
                        setTechSkills(selectedOptions.map(option => option.value));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Type or select your skills..."
                />
            </div>

            <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                Submit
            </button>
        </form>
    );
};

export default ProfileFormInterviewer;
