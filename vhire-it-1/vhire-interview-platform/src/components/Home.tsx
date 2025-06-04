import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate=useNavigate();
    return (
        <>
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        <div className="@container">
                            <div className="@[480px]:p-4">
                                <div
                                    className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4"
                                    style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://cdn.usegalileo.ai/sdxl10/bdbb6a67-fa97-4ed7-bdf5-0726ecf364df.png")' }}
                                >
                                    <div className="flex flex-col gap-2 text-center">
                                        <h1
                                            className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                                        >
                                            Your next great hire is one interview away
                                        </h1>
                                        <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                                            Vhire helps companies and interviewers conduct structured interviews that are fair and effective.
                                        </h2>
                                    </div>
                                    <button
                                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#F4C753] text-[#141C24] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                                    >
                                        <span className="truncate">Learn more</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-10 px-4 py-10 @container">
                            <div className="flex flex-col gap-4">
                                <h1
                                    className="text-[#141C24] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                                >
                                    How it works
                                </h1>
                                <p className="text-[#141C24] text-base font-normal leading-normal max-w-[720px]">
                                    We help you create a job posting, write interview questions, conduct interviews, and evaluate candidates. You'll get access to our library of interview questions,
                                    coding challenges, and role-specific evaluations, as well as real-time feedback on how to improve your hiring process.
                                </p>
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
                                <div className="flex flex-col gap-3 pb-3">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                                        style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/5d0e7f74-50ad-4f60-afa4-a81693766e41.png")' }}
                                    ></div>
                                    <div>
                                        <p className="text-[#141C24] text-base font-medium leading-normal">Post a job</p>
                                        <p className="text-[#3F5374] text-sm font-normal leading-normal">
                                            Create a job posting. We'll help you write a job description and recommend a salary range based on your job title and location
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 pb-3">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                                        style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/61669c3e-93d1-4d02-996f-56edf2e2ea8f.png")' }}
                                    ></div>
                                    <div>
                                        <p className="text-[#141C24] text-base font-medium leading-normal">Interview with Vhire</p>
                                        <p className="text-[#3F5374] text-sm font-normal leading-normal">
                                            Write an interview question or use one of our templates. We'll help you make sure it's relevant to the job and not biased
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 pb-3">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                                        style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/707cd356-4d38-4bf6-8542-bf41e5f807af.png")' }}
                                    ></div>
                                    <div>
                                        <p className="text-[#141C24] text-base font-medium leading-normal">Interview with Vhire</p>
                                        <p className="text-[#3F5374] text-sm font-normal leading-normal">
                                            Conduct an interview with a candidate. We'll help you structure the interview and avoid asking illegal questions
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 pb-3">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                                        style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/62a80569-58ad-409c-8650-544ef2e4787b.png")' }}
                                    ></div>
                                    <div>
                                        <p className="text-[#141C24] text-base font-medium leading-normal">Interview with Vhire</p>
                                        <p className="text-[#3F5374] text-sm font-normal leading-normal">
                                            Review interview results. We'll help you evaluate your candidates fairly and make data-driven hiring decisions
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="@container">
                            <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                                <div className="flex flex-col gap-2 text-center">
                                    <h1
                                        className="text-[#141C24] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                                    >
                                        Ready to start interviewing top talent?
                                    </h1>
                                </div>
                                <div className="flex flex-1 justify-center">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={()=>{
                                                navigate('/dashboard');
                                            }}
                                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#F4C753] text-[#141C24] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow"
                                        >
                                            <span className="truncate">Get started</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
