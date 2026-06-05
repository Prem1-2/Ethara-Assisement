"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

export function SimpleCalendar({ highlightedDates = [] }) {
	const [viewDate, setViewDate] = useState(new Date());
	const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
	
	const monthYear = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

	const calendarData = useMemo(() => {
		const year = viewDate.getFullYear();
		const month = viewDate.getMonth();
		
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();
		
		const dates = [];
		
		// Previous month days
		for (let i = firstDay - 1; i >= 0; i--) {
			dates.push({ d: daysInPrevMonth - i, m: 'prev' });
		}
		
		// Current month days
		const today = new Date();
		for (let i = 1; i <= daysInMonth; i++) {
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
			dates.push({
				d: i,
				current: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year,
				active: highlightedDates.includes(dateStr)
			});
		}
		
		// Next month days
		const remaining = 35 - dates.length;
		for (let i = 1; i <= remaining; i++) {
			dates.push({ d: i, m: 'next' });
		}
		
		return dates;
	}, [viewDate, highlightedDates]);

	const changeMonth = (offset) => {
		setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
	};

	return (
		<div className="flex flex-col gap-6 p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all h-full">
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Calendar</h3>
					<p className="text-xs font-bold text-foreground">{monthYear}</p>
				</div>
				<div className="flex items-center gap-1">
					<button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><ChevronLeft className="size-4" /></button>
					<button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><ChevronRight className="size-4" /></button>
				</div>
			</div>
			
			<div className="grid grid-cols-7 gap-y-3 text-center">
				{days.map(d => (
					<span key={d} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{d}</span>
				))}
				{calendarData.map((date, i) => (
					<div key={i} className="flex flex-col items-center justify-center relative py-1">
						<span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-default
							${date.m ? 'text-muted-foreground/30' : 'text-foreground hover:bg-primary/10 hover:text-primary'}
							${date.current ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary/20' : ''}
							${date.active ? 'border-2 border-primary/40' : ''}
						`}>
							{date.d}
						</span>
						{date.active && !date.current && (
							<span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary animate-pulse" />
						)}
					</div>
				))}
			</div>
			
			{highlightedDates.length > 0 && (
				<div className="mt-2 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
					<div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
					<p className="text-[10px] font-bold text-primary uppercase tracking-widest">{highlightedDates.length} Deadlines Scheduled</p>
				</div>
			)}
		</div>
	);
}
