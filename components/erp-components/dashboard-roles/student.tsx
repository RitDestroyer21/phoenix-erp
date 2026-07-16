"use client";

import { useState, useEffect } from "react";
import { 
  CalendarDays, 
  BookOpen, 
  UploadCloud, 
  ChevronLeft, 
  ChevronRight, 
  BookMarked,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  FileText,
  AlertCircle
} from "lucide-react";


// Enforce types matching the db schema attributes
export interface StudentSubject { 
  id: string;
  code: string;
  name: string;
  department: string;
  section: string;
  sessionId: string;
  semesterId: string;
  instructorName?: string;
}

export interface StudentProfileData {
  studentId: string;
  name: string;
  departmentName: string;
  section: string;
  sessionId: string;
  subjects: StudentSubject[];
}

// Highly realistic mock database client layer to ensure absolute zero-dependency compilation in sandbox
const simulatedFetchStudentData = async (authUserId: string): Promise<StudentProfileData> => {
  // Simulates a database latency of 600ms
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    studentId: "stud_9921_bc",
    name: "Alex Rivera",
    departmentName: "Computer Science & Engineering",
    section: "A",
    sessionId: "sess_2026_active",
    subjects: [
      {
        id: "sub_cs_401",
        code: "CS-401",
        name: "Analysis of Algorithms",
        department: "Computer Science & Engineering",
        section: "A",
        sessionId: "sess_2026_active",
        semesterId: "sem_04",
        instructorName: "Dr. Sarah Jenkins"
      },
      {
        id: "sub_cs_402",
        code: "CS-402",
        name: "Database Management Systems",
        department: "Computer Science & Engineering",
        section: "A",
        sessionId: "sess_2026_active",
        semesterId: "sem_04",
        instructorName: "Prof. Michael Sterling"
      },
      {
        id: "sub_cs_403",
        code: "CS-403",
        name: "Operating Systems Layout",
        department: "Computer Science & Engineering",
        section: "A",
        sessionId: "sess_2026_active",
        semesterId: "sem_04",
        instructorName: "Dr. Arthur Vance"
      }
    ]
  };
};


// Real-time simulated databases for sub-views
const SIMULATED_ATTENDANCE_DB: Record<string, { date: string; status: "Present" | "Absent" }[]> = {
  "sub_cs_401": [
    { date: "2026-04-01", status: "Present" },
    { date: "2026-04-03", status: "Present" },
    { date: "2026-04-06", status: "Present" },
    { date: "2026-04-08", status: "Absent" },
    { date: "2026-04-10", status: "Present" },
    { date: "2026-04-13", status: "Present" },
    { date: "2026-04-15", status: "Present" },
  ],
  "sub_cs_402": [
    { date: "2026-04-02", status: "Present" },
    { date: "2026-04-04", status: "Absent" },
    { date: "2026-04-07", status: "Absent" },
    { date: "2026-04-09", status: "Present" },
    { date: "2026-04-11", status: "Present" },
  ],
  "sub_cs_403": [
    { date: "2026-04-01", status: "Present" },
    { date: "2026-04-05", status: "Present" },
    { date: "2026-04-08", status: "Present" },
    { date: "2026-04-12", status: "Present" },
  ]
};

const SIMULATED_LESSONS_DB: Record<string, any[]> = {
  "sub_cs_401": [
    {
      id: "l_1",
      topic: "Introduction to Dynamic Programming",
      narrative: "Explored overlapping subproblems, optimal substructure criteria, and memoization arrays.",
      date: "2026-04-15",
      duration: "02 Hours",
      status: "On-Track",
      attachment: "DP_LectureNotes_01.pdf"
    },
    {
      id: "l_2",
      topic: "Greedy Algorithms and Huffman Coding",
      narrative: "Analyzed greedy choice property, optimal prefix codes, and built sample frequency trees.",
      date: "2026-04-10",
      duration: "02 Hours",
      status: "On-Track",
      attachment: "HuffmanCoding_Slides.pdf"
    }
  ],
  "sub_cs_402": [
    {
      id: "l_3",
      topic: "Relational Algebra Operations",
      narrative: "Studied projection, selection, cartesian products, and natural joins on schemas.",
      date: "2026-04-14",
      duration: "02 Hours",
      status: "On-Track",
      attachment: "Relational_Algebra_Guide.pdf"
    }
  ],
  "sub_cs_403": [
    {
      id: "l_4",
      topic: "Process Scheduling Algorithms",
      narrative: "Analyzed First-Come First-Served (FCFS), Shortest Job Next, and Round Robin timelines.",
      date: "2026-04-13",
      duration: "02 Hours",
      status: "On-Track",
      attachment: "Scheduling_Algorithms_v2.pdf"
    }
  ]
};

const SIMULATED_ASSIGNMENTS_DB: Record<string, any[]> = {
  "sub_cs_401": [
    {
      id: "assign_1",
      title: "Asymptotic Complexity & Recursion Proofs",
      deadline: "2026-04-25 11:59 PM",
      status: "Pending Action",
      weight: "15%",
      description: "Submit written proofs verifying Master Method calculations and recurrence tree complexities."
    },
    {
      id: "assign_2",
      title: "Dynamic Programming Knapsack Implementation",
      deadline: "2026-04-18 11:59 PM",
      status: "Submitted",
      weight: "10%",
      description: "Implement 0/1 Knapsack solution in clean Python. Include memory optimization analysis."
    }
  ],
  "sub_cs_402": [
    {
      id: "assign_3",
      title: "Schema Normalization Assignment",
      deadline: "2026-04-28 11:59 PM",
      status: "Pending Action",
      weight: "10%",
      description: "Decompose database relation states into third normal form (3NF) and BCNF standards."
    }
  ],
  "sub_cs_403": [
    {
      id: "assign_4",
      title: "Thread Concurrency and Mutex Simulation",
      deadline: "2026-04-30 11:59 PM",
      status: "Pending Action",
      weight: "12%",
      description: "Build a thread-safe implementation modeling producer-consumer buffer limits."
    }
  ]
};


interface AttendanceProps {
  subject: StudentSubject;
  studentId: string;
}

function StudentViewAttendance({ subject, studentId }: AttendanceProps) {
  const [attendanceLogs, setAttendanceLogs] = useState<{ date: string; status: "Present" | "Absent" }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const logs = SIMULATED_ATTENDANCE_DB[subject.id] || [];
      setAttendanceLogs(logs);
      setIsLoading(false);
    }
    loadAttendance();
  }, [subject.id]);

  const totalClasses = attendanceLogs.length;
  const presentCount = attendanceLogs.filter(log => log.status === "Present").length;
  const absentCount = totalClasses - presentCount;
  const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  let statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  let statusText = "Safe — Eligible for Exams";
  if (percentage < 75) {
    statusColor = "text-rose-600 bg-rose-50 border-rose-200";
    statusText = "Risk Warning — Attendance Deficit";
  } else if (percentage < 80) {
    statusColor = "text-amber-600 bg-amber-50 border-amber-200";
    statusText = "Borderline — Maintain Presence";
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Attendance Statistics Ledger</h3>
          <p className="text-sm text-slate-500">Real-time compilation of tracked lecture presences.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border text-sm font-semibold ${statusColor}`}>
          {statusText}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Percentage</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-slate-900">{percentage}%</span>
            <span className="text-sm text-slate-500">of 75% limit</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full ${percentage >= 75 ? "bg-emerald-500" : "bg-rose-500"}`} 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Count</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-emerald-600">{presentCount}</span>
            <span className="text-sm text-slate-500">Lectures logged</span>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-4">Verified by Instructor</span>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent Count</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-rose-500">{absentCount}</span>
            <span className="text-sm text-slate-500">Lectures missed</span>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-4">Excuses require HOD approval</span>
        </div>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-800">Chronological Roll-Call Log</h4>
        </div>
        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {attendanceLogs.length > 0 ? (
            attendanceLogs.map((log, index) => (
              <div key={index} className="px-6 py-3.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-600">{log.date}</span>
                <span className={`flex items-center gap-1.5 font-bold ${
                  log.status === "Present" ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {log.status === "Present" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {log.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-slate-400">No attendance logs found for this course.</div>
          )}
        </div>
      </div>
    </div>
  );
}


interface LessonProps {
  subjectId: string;
}

function StudentViewLessons({ subjectId }: LessonProps) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLessons(SIMULATED_LESSONS_DB[subjectId] || []);
      setIsLoading(false);
    }
    loadLessons();
  }, [subjectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Syllabus Progress Ledger</h3>
        <p className="text-sm text-slate-500">Track structured lecture updates and retrieve classroom files.</p>
      </div>

      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div key={lesson.id} className="p-5 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors bg-white flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2 flex-grow max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                    {lesson.date}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                    <Clock size={12} /> {lesson.duration}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-800">{lesson.topic}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{lesson.narrative}</p>
              </div>

              <div className="flex flex-col justify-between items-end gap-3 min-w-[180px]">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                  Syllabus {lesson.status}
                </span>
                {lesson.attachment && (
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all self-end">
                    <Download size={14} />
                    <span>Download Materials</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center border border-slate-100 rounded-2xl text-slate-400 text-sm">
            No lessons plans logged by the instructor yet.
          </div>
        )}
      </div>
    </div>
  );
}


interface AssignmentProps {
  subjectId: string;
  studentId: string;
}

function StudentSubmitAssignment({ subjectId, studentId }: AssignmentProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeSelect, setActiveSelect] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [textSubmission, setTextSubmission] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAssignments() {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const list = SIMULATED_ASSIGNMENTS_DB[subjectId] || [];
      setAssignments(list);
      if (list.length > 0) {
        setActiveSelect(list[0]);
      } else {
        setActiveSelect(null);
      }
      setIsLoading(false);
    }
    loadAssignments();
  }, [subjectId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerUpload = async () => {
    if (!selectedFile || !activeSelect) return;
    setUploadSuccess(true);
    
    // Simulate API storage write transaction
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setUploadSuccess(false);
    setSelectedFile(null);
    setTextSubmission("");
    
    // Update active state locally
    setAssignments(prev => prev.map(item => 
      item.id === activeSelect.id ? { ...item, status: "Submitted" } : item
    ));
    setActiveSelect((prev: any) => ({ ...prev, status: "Submitted" }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!activeSelect) {
    return (
      <div className="p-12 text-center text-sm text-slate-400">
        No assigned courseworks tracked for this subject context.
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn h-full overflow-hidden">
      {/* List of Tasks */}
      <div className="lg:col-span-5 space-y-4 overflow-y-auto max-h-[480px] pr-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Coursework</h3>
        {assignments.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSelect(item)}
            className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
              activeSelect.id === item.id 
                ? "border-purple-500 bg-purple-50/10 shadow-sm" 
                : "border-slate-100 hover:border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between w-full">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                item.status === "Submitted" 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                  : "bg-purple-50 text-purple-700 border border-purple-100"
              }`}>
                {item.status}
              </span>
              <span className="text-xs font-semibold text-slate-400">Weight: {item.weight}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock size={12} /> Deadline: {item.deadline}
            </div>
          </button>
        ))}
      </div>

      {/* Upload/Workspace Pane */}
      <div className="lg:col-span-7 border border-slate-100 bg-slate-50/50 rounded-2xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-purple-600">Task Workspace Context</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{activeSelect.title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activeSelect.description}</p>
          </div>

          {activeSelect.status === "Submitted" ? (
            <div className="p-8 bg-white border border-emerald-100 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Coursework Submitted Successfully</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Your submitted files have been locked and integrated into the grading ledger. Instructors can now review and assign credits.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center text-center justify-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-purple-500 bg-purple-50/20" 
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input 
                  type="file" 
                  id="assignment-file" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <label htmlFor="assignment-file" className="cursor-pointer flex flex-col items-center">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-full border border-purple-100 mb-2">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-sm font-bold text-slate-800">Drag or Browse Work Files</span>
                  <span className="text-xs text-slate-400 mt-1">Acceptable file extensions: .zip, .pdf, .docx (Max 10MB)</span>
                </label>
              </div>

              {selectedFile && (
                <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-purple-600" />
                    <span className="font-bold text-slate-700 truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Comments Area */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Narrative Comments / Links</label>
                <textarea
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Insert additional implementation details, external repository URLs, or feedback logs for reviewers..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all min-h-[80px]"
                />
              </div>
            </div>
          )}
        </div>

        {activeSelect.status !== "Submitted" && (
          <button
            onClick={triggerUpload}
            disabled={!selectedFile || uploadSuccess}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
              selectedFile 
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {uploadSuccess ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing Upload Request...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                <span>Commit & Submit to Task Vault</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}


type ActiveTab = "attendance" | "view-lesson" | "submit-assignment" | null;

interface StudentDashboardProps {
  userId: string;
}

export default function StudentDashboardView({ userId }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfileData | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function syncDashboardData() {
      if (!userId) return;
      setIsLoading(true);

      try {
        // Safe database fetching logic
        const result = await simulatedFetchStudentData(userId);
        if (result) {
          setStudentData(result);
          if (result.subjects && result.subjects.length > 0) {
            setSelectedSubjectId(result.subjects[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load live student metadata context:", err);
      } finally {
        setIsLoading(false);
      }
    }

    syncDashboardData();
  }, [userId]);

  const assignedSubjects = studentData?.subjects ?? [];
  const activeSubject = assignedSubjects.find(sub => sub.id === selectedSubjectId);

  const tiles = [
    {
      id: "attendance" as const,
      title: "View Attendance",
      description: "Audit your lecture presences, track percentage metrics, and verify your criteria thresholds.",
      icon: CalendarDays,
      color: "border-emerald-500 hover:border-emerald-600 bg-emerald-50/30 text-emerald-700",
      badge: "Real-time Metrics"
    },
    {
      id: "view-lesson" as const,
      title: "View Lesson Progress",
      description: "Browse chronological class progress registers, review covered topics, and retrieve files.",
      icon: BookOpen,
      color: "border-blue-500 hover:border-blue-600 bg-blue-50/30 text-blue-700",
      badge: "Syllabus Index"
    },
    {
      id: "submit-assignment" as const,
      title: "Submit Assignment",
      description: "Track your homework deadlines, check grades, and submit your evaluation work files.",
      icon: UploadCloud,
      color: "border-purple-500 hover:border-purple-600 bg-purple-50/30 text-purple-700",
      badge: "Task Vault"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] w-full bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  if (!studentData || assignedSubjects.length === 0) {
    return (
      <div className="p-6 w-full max-w-xl mx-auto text-center mt-20 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">No Program Assignments Found</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your profile resolves correctly, but no active course mappings or schedules could be traced to your section and cohort.
        </p>
      </div>
    );
  }

  if (!activeTab) {
    return (
      <div className="p-6 w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Student Portal Console</h2>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {studentData.name}! | Batch Section: <span className="font-semibold text-slate-700">{studentData.section}</span> | Department: <span className="font-semibold text-slate-700">{studentData.departmentName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => setActiveTab(tile.id)}
                className={`flex flex-col text-left p-6 border rounded-2xl shadow-sm transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md ${tile.color}`}
              >
                <div className="flex justify-between items-start w-full mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-current/10">
                    {tile.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{tile.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-grow">
                  {tile.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50">
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 relative ${
          isSidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 bg-white border border-slate-200 text-slate-500 rounded-full p-1 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm z-10"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="flex-1 flex flex-col pt-5 overflow-y-auto">
          <div className="px-4 mb-5">
            <button
              onClick={() => {
                setActiveTab(null);
                setIsSidebarCollapsed(false);
              }}
              className="flex items-center gap-2.5 w-full text-slate-500 hover:text-slate-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={16} />
              {!isSidebarCollapsed && <span>Dashboard Hub</span>}
            </button>
          </div>

          <div className="border-t border-slate-100 my-2" />

          <nav className="flex-1 px-4 py-3 space-y-1.5">
            {tiles.map((tile) => {
              const Icon = tile.icon;
              const isActive = activeTab === tile.id;
              return (
                <button
                  key={tile.id}
                  onClick={() => setActiveTab(tile.id)}
                  className={`flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="ml-3 truncate">{tile.title}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white text-xs">
              {studentData.name.substring(0, 1).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">{studentData.name}</span>
                <span className="text-[10px] text-slate-500 font-semibold truncate">{studentData.departmentName}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <BookMarked size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Workspace Context</span>
              <h1 className="text-lg font-bold text-slate-800">
                {activeSubject ? `[${activeSubject.code}] ${activeSubject.name}` : "Select Course"}
                {activeSubject?.section && <span className="text-xs font-normal text-slate-400 ml-2">({activeSubject.section})</span>}
              </h1>
              {activeSubject?.instructorName && (
                <p className="text-xs text-slate-400 mt-0.5">Instructor: {activeSubject.instructorName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="student-course-selector" className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
              Active Course:
            </label>
            <select
              id="student-course-selector"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
            >
              {assignedSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  [{sub.code}] {sub.name} {sub.section ? `(${sub.section})` : ""}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="flex-1 p-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full min-h-[400px]">
            {activeTab === "attendance" && activeSubject && (
              <StudentViewAttendance subject={activeSubject} studentId={studentData.studentId}/>
            )}
            {activeTab === "view-lesson" && (
              <StudentViewLessons subjectId={selectedSubjectId} />
            )}
            {activeTab === "submit-assignment" && (
              <StudentSubmitAssignment subjectId={selectedSubjectId} studentId={studentData.studentId}/>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}