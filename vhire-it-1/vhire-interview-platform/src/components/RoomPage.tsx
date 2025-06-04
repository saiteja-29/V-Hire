import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { APPID, SERVERSECRET } from '../config/zegoconfig';
import { useUser } from '../context/UserContext';
import { io } from "socket.io-client";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { Extension } from '@codemirror/state';
import axios from "axios";
import { db } from "../config/firebaseConfig";
import { collection, doc, setDoc, query, where, getDocs, updateDoc } from "firebase/firestore";

import ReactMarkdown from 'react-markdown';

const socket = io("http://localhost:5001");
const languages: {
    [key: string]: {
      name: string;
      ext: string;
      mode: Extension;
    };
  } = {
    cpp: { name: "C++", ext: "cpp", mode: cpp() },
    python: { name: "Python", ext: "py", mode: python() },
    java: { name: "Java", ext: "java", mode: java() },
    javascript: { name: "JavaScript", ext: "js", mode: javascript() },
  };


const RoomPage: React.FC = () => {
    const { roomId } = useParams();
    const [code, setCode] = useState("// Start coding...");
    const [language, setLanguage] = useState("cpp");
    const location = useLocation();


    const {user,login}= useUser();
    // Function to parse query parameters
    const getQueryParams = (search: any) => {
        return new URLSearchParams(search);
    };

    // Get the name from the query parameters
    const queryParams = getQueryParams(location.search);
    const name = queryParams.get('name');

    console.log(name);
    const navigate = useNavigate();
    const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);
    const [callType, setCallType] = useState("");
    const [copied, setCopied] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [showAISection, setShowAISection] = useState(true);
    const [output, setOutput] = useState("");

    const handleLeaveRoom = () => {
        // if (zpRef.current) {
            
        //     zpRef.current.destroy();
        // }
        navigate("/dashboard");
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const type = query.get("type");
        setCallType(type || "");
    }, [location.search]);

    useEffect(() => {
        if (!callType || !roomId ||!user) return;
        
        const appID: number = APPID;
        const serverSecret: string = SERVERSECRET;
        // console.log(appID, serverSecret);
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, Date.now().toString(), name?.toString() || "");
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp; 
        const storeRoomInfo = async () => {
            try {
                await setDoc(doc(db, "interview_report", roomId), {
                    interviewerEmail: user.email,
                    timestamp: new Date().toISOString(),
                    status: 'ongoing'
                });
            } catch (error) {
                console.error("Error storing room info:", error);
            }
        };

        if (user.role === 'interviewer') {
            storeRoomInfo();
        }
        zp.joinRoom({
            container: videoContainerRef.current,
            scenario: { mode: callType === "one-on-one" ? ZegoUIKitPrebuilt.OneONoneCall : ZegoUIKitPrebuilt.GroupCall },
            maxUsers: callType === "one-on-one" ? 2 : 10,
            onJoinRoom: ()=>{
                console.log(user);
            },
            onLeaveRoom: async () => {
                try {
                    // Update interview_report for both roles
                    const reportRef = doc(db, "interview_report", roomId);
                    if (user?.role === 'interviewer') {
                        // await setDoc(reportRef, {
                        //     interviewerEmail: user.email
                        // }, { merge: true });
                    } else if (user?.role === 'candidate') {
                        await setDoc(reportRef, {
                            candidateEmail: user.email
                        }, { merge: true });
                    }
            
                    // Find the matching document in 'interviews' collection
                    const querySnapshot = await getDocs(query(
                        collection(db, "interviews"),
                        where("roomId", "==", roomId)
                    ));
            
                    if (!querySnapshot.empty) {
                        const docRef = querySnapshot.docs[0].ref;
                        if (user?.role === 'interviewer') {
                            await updateDoc(docRef, {
                                verifiedInterviewerEmail: user.email
                            });
                            navigate('/report', { state: { roomId } });
                        } else if (user?.role === 'candidate') {
                            await updateDoc(docRef, {
                                verifiedCandidateEmail: user.email
                            });
                            navigate('/dashboard');
                        } else {
                            navigate('/dashboard');
                        }
                    } else {
                        console.warn("No matching interview doc found.");
                        navigate('/dashboard');
                    }
                } catch (error) {
                    console.error("Error updating interview document:", error);
                    navigate('/dashboard');
                }
            }
            
        });
        
        // return () => zp.destroy();
    }, [callType, roomId, navigate, user, name, location.search]);

    useEffect(() => {
        console.log("Joining room:", roomId);
        socket.emit("joinRoom", roomId);
    
        socket.on("codeChange", (newCode) => {
          console.log("Received code update:", newCode);
          setCode(newCode);
        });
    
        socket.on("languageChange", (newLanguage) => {
          console.log("Received language update:", newLanguage);
          setLanguage(newLanguage);
        });
    
        return () => {
          socket.off("codeChange");
          socket.off("languageChange");
        };
      }, [roomId]);

    const handleCopyRoomId = async () => {
        const meetingLink = `${roomId}`;
        try {
            await navigator.clipboard.writeText(meetingLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy room ID:', err);
        }
    };

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        socket.emit("codeChange", { roomId, code: newCode });
      };
      
      const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
        socket.emit("languageChange", { roomId, language: newLanguage });
      };
    
      const handleRun = async () => {
        try {
          const response = await axios.post("http://localhost:5001/run", {
            language,
            code,
          });
          setOutput(response.data.output);
        } catch (error) {
          setOutput("Error executing code");
        }
      };

    return (
        <div className="flex h-screen w-full flex-col bg-gray-50 overflow-auto">
            {/* <div className="w-full bg-white shadow-md p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Room ID:
                        </h1>
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                            <code className="text-sm text-gray-700">
                                {`${roomId}`}
                            </code>
                            <button 
                                onClick={handleCopyRoomId}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        {user?.role === 'interviewer' && (
                            <div className="p-4">
                                <button
                                    onClick={() => setShowAISection((prev) => !prev)}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                                >
                                    {showAISection ? 'Hide AI Assistant' : 'Show AI Assistant'}
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => handleLeaveRoom()} 
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div> */}
            <div className="flex flex-1">
            {/* Left: Code Editor & Controls */}
                <div className="w-[40%] p-4 h-[500px] flex flex-col mb-2 overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-2">Code Editor</h2>
                    <div className="mb-4 flex justify-between items-center">
                        <select
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            value={language}
                            className="border px-2 py-1 rounded"
                        >
                            {Object.keys(languages).map((key) => (
                            <option key={key} value={key}>
                                {languages[key].name}
                            </option>
                            ))}
                        </select>
                        <button
                            onClick={handleRun}
                            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                        >
                            Run
                        </button>
                    </div>

                    <CodeMirror
                    value={code}
                    height="275px"
                    extensions={[languages[language].mode]}
                    onChange={handleCodeChange}
                    className="border rounded mb-4"
                    />

                    <h2 className="text-lg font-semibold">Output</h2>
                    <pre className="h-full output bg-gray-100 p-2 rounded overflow-auto">{output}</pre>
                </div>

                {/* Right: Video Container */}
                <div
                    ref={videoContainerRef}
                    className="w-[60%] h-[500px] flex items-center justify-center overflow-y-auto"
                />
            </div>
           
            {user?.role === 'interviewer' && showAISection &&(
                <div className="w-full p-4 bg-white shadow-md mt-8">
                    <h2 className="text-xl font-semibold mb-2">Ask AI</h2>
                    <div className="flex flex-col md:flex-row items-start gap-4">
                        <input
                            type="text"
                            placeholder="Enter your prompt here..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="w-full md:w-2/3 border rounded-md px-4 py-2"
                        />
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch("http://localhost:5001/api/gemini", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ prompt: aiPrompt }),
                                    });
                                    const data = await res.json();
                                    setAiResponse(data.response);
                                } catch (err) {
                                    console.error(err);
                                    setAiResponse("Error fetching AI response.");
                                }
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Ask
                        </button>
                    </div>

                    {aiResponse && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-md border h-[30vh] overflow-y-auto">
                            <h3 className="font-semibold text-gray-800 mb-2">AI Response:</h3>
                            <div className="prose prose-sm text-gray-700 max-w-none">
                                <ReactMarkdown>
                                    {aiResponse}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        
    );
};

export default RoomPage;
