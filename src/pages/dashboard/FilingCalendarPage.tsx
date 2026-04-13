import DashboardLayout from "@/components/DashboardLayout";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const filings = [
  { name: "GSTR-3B", type: "gst", day: 20, color: "bg-fyn-red" },
  { name: "GSTR-1", type: "gst", day: 11, color: "bg-fyn-red" },
  { name: "TDS Return", type: "tds", day: 30, color: "bg-blue-500", quarterly: true },
  { name: "Advance Tax", type: "tax", day: 15, color: "bg-blue-500", quarterly: true },
  { name: "PF Deposit", type: "pf", day: 15, color: "bg-teal-500" },
  { name: "ESIC Deposit", type: "pf", day: 15, color: "bg-teal-500" },
];

const upcomingFilings = [
  { name: "GSTR-3B", due: "Apr 20", days: 8, urgency: "warning", status: "Data ready" },
  { name: "PF Deposit", due: "Apr 15", days: 3, urgency: "critical", status: "₹1.01L due" },
  { name: "ESIC Deposit", due: "Apr 15", days: 3, urgency: "critical", status: "₹27K due" },
  { name: "TDS Return Q4", due: "Apr 30", days: 18, urgency: "normal", status: "In preparation" },
  { name: "GSTR-1 May", due: "May 11", days: 29, urgency: "normal", status: "Not started" },
  { name: "Advance Tax Q1", due: "Jun 15", days: 64, urgency: "normal", status: "Estimated ₹2.4L" },
  { name: "Annual ROC Filing", due: "Sep 30", days: 171, urgency: "normal", status: "Not due yet" },
];

const today = new Date();
const currentMonth = today.getMonth();
const daysInMonth = new Date(today.getFullYear(), currentMonth + 1, 0).getDate();
const firstDayOfWeek = new Date(today.getFullYear(), currentMonth, 1).getDay();

const FilingCalendarPage = () => (
  <DashboardLayout>
    {/* Calendar grid */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fyn-ink font-serif text-lg">{months[currentMonth]} {today.getFullYear()}</h3>
        <div className="flex gap-2">
          <button className="text-fyn-ink/40 text-sm hover:text-fyn-ink">← Prev</button>
          <button className="text-fyn-ink/40 text-sm hover:text-fyn-ink">Next →</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-fyn-ink/30 text-xs fyn-label py-1">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayFilings = filings.filter((f) => f.day === day);
          const isToday = day === today.getDate();
          return (
            <div key={day} className={`p-2 rounded-lg text-sm relative ${isToday ? "bg-fyn-red/10 ring-1 ring-fyn-red" : "hover:bg-fyn-ink/5"}`}>
              <span className={isToday ? "text-fyn-red font-bold" : "text-fyn-ink/60"}>{day}</span>
              {dayFilings.length > 0 && (
                <div className="flex gap-0.5 justify-center mt-1">
                  {dayFilings.map((f) => (
                    <span key={f.name} className={`w-1.5 h-1.5 rounded-full ${f.color}`} title={f.name} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fyn-red" /> GST</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> TDS/IT</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> PF/ESIC</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> ROC</span>
      </div>
    </div>

    {/* List view */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">Upcoming Filings</h3>
      <div className="space-y-2">
        {upcomingFilings.map((f) => (
          <div key={f.name + f.due} className="flex items-center gap-3 p-3 bg-fyn-beige rounded-lg">
            <span className={`w-2 h-2 rounded-full ${
              f.urgency === "critical" ? "bg-fyn-red" : f.urgency === "warning" ? "bg-amber-500" : "bg-fyn-ink/20"
            }`} />
            <div className="flex-1">
              <p className="text-fyn-ink font-medium text-sm">{f.name}</p>
              <p className="text-fyn-ink/40 text-xs">{f.status}</p>
            </div>
            <div className="text-right">
              <p className="text-fyn-ink text-sm fyn-metric">{f.due}</p>
              <p className={`text-xs ${f.days <= 5 ? "text-fyn-red" : f.days <= 14 ? "text-fyn-warning" : "text-fyn-ink/40"}`}>{f.days} days</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default FilingCalendarPage;
