'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Search, CheckCircle2, Clock } from 'lucide-react';
import { fetchLeaderboard } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';
import { cn, getUserColor } from '@/lib/utils';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then(res => {
      if (res.success) setLeaderboard(res.data || []);
      setLoading(false);
    });
  }, []);

  // Use the full fake leaderboard from UI screenshot
  const fullLeaderboard = loading ? [] : [
    { rank: 1, name: 'Maya Patel', id: 's2021001', xp: 8420, solved: 98, time: 0.8, delta: 0, initials: 'MA', isMe: false, colIdx: 1 },
    { rank: 2, name: 'Liam Zhang', id: 's2021045', xp: 7815, solved: 91, time: 1.1, delta: 1, initials: 'LI', isMe: false, colIdx: 0 },
    { rank: 3, name: 'Sofia Rodriguez', id: 's2020187', xp: 7640, solved: 89, time: 0.9, delta: -1, initials: 'SO', isMe: false, colIdx: 2 },
    { rank: 4, name: 'Aiden Kim', id: 's2021078', xp: 6930, solved: 82, time: 1.4, delta: 0, initials: 'AI', isMe: false, colIdx: 4 },
    { rank: 5, name: 'Priya Sharma', id: 's2022003', xp: 6520, solved: 76, time: 1.2, delta: 2, initials: 'PR', isMe: false, colIdx: 5 },
    { rank: 6, name: 'Alex Chen', id: 's1234567', xp: 6180, solved: 72, time: 2.1, delta: -1, initials: 'AL', isMe: true, colIdx: 3 },
    { rank: 7, name: 'Noah Williams', id: 's2021234', xp: 5840, solved: 68, time: 1.8, delta: -1, initials: 'NO', isMe: false, colIdx: 4 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-brand-charcoal-card border border-brand-charcoal-border shadow-lg">
          <Trophy size={32} className="text-brand-muted-gold" />
        </div>
        <h1 className="text-4xl font-bold text-brand-offwhite">Leaderboard</h1>
        <p className="text-brand-offwhite-muted">15 students competing · Updated live</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center gap-6 items-end mt-12 mb-8">
        {[fullLeaderboard[1], fullLeaderboard[0], fullLeaderboard[2]].map((user, i) => {
           if(!user) return null;
           const isFirst = i === 1;
           const isSecond = i === 0;
           return (
             <div key={user.rank} className={cn(
               "flex flex-col items-center p-6 bg-brand-charcoal-card border rounded-2xl shadow-lg relative transition-transform hover:-translate-y-2",
               isFirst ? "border-brand-muted-gold/50 w-72 h-44 shadow-brand-muted-gold/10" : "border-brand-charcoal-border w-64 h-36"
             )}>
                <div className={cn("absolute -top-6 w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-inner text-white border-4 border-brand-charcoal-base", getUserColor(user.colIdx))}>
                  {user.initials}
                </div>
                <div className="mt-8 text-center">
                  <div className={cn("font-bold", isFirst ? "text-xl text-brand-offwhite" : "text-lg text-brand-offwhite-muted")}>{user.name}</div>
                  <div className="flex items-center justify-center gap-1 text-brand-muted-gold font-bold mt-2">
                    <svg width="10" height="12" viewBox="0 0 12 16" fill="currentColor">
                      <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                    </svg>
                    {user.xp.toLocaleString()}
                  </div>
                  <div className="bg-brand-charcoal-hover text-brand-offwhite-muted text-xs font-bold px-3 py-1 rounded w-max mx-auto mt-3">
                    {user.rank}{user.rank === 1 ? 'st' : user.rank === 2 ? 'nd' : 'rd'}
                  </div>
                </div>
             </div>
           );
        })}
      </div>

      {/* Current User Stats Bar */}
      <div className="bg-gradient-to-r from-brand-charcoal-base to-brand-charcoal-card border border-brand-muted-gold/30 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-brand-muted-gold/5">
        <div className="flex items-center gap-5">
           <div className="w-10 h-10 rounded-full bg-brand-charcoal-base border border-brand-charcoal-border flex items-center justify-center font-mono font-bold text-brand-offwhite-muted">6</div>
           <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-inner", getUserColor(3))}>AL</div>
           <div>
             <div className="text-sm font-medium text-brand-muted-gold">Your Ranking</div>
             <div className="text-xl font-bold text-brand-offwhite font-sans">Alex Chen</div>
           </div>
        </div>
        <div className="flex items-center gap-8 text-right">
          <div>
            <div className="text-xl font-bold text-brand-muted-gold">6,180</div>
            <div className="text-xs text-brand-offwhite-muted font-medium uppercase tracking-wider">XP</div>
          </div>
          <div>
            <div className="text-xl font-bold text-brand-offwhite">72</div>
            <div className="text-xs text-brand-offwhite-muted font-medium uppercase tracking-wider">Solved</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#8DB4B9]">2.1ms</div>
            <div className="text-xs text-brand-offwhite-muted font-medium uppercase tracking-wider">Best</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden">
        {/* Table Header Filter */}
        <div className="p-4 border-b border-brand-charcoal-border flex justify-between items-center bg-brand-charcoal-hover/30">
           <div className="relative w-64">
             <input type="text" placeholder="Search students..." className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-muted-gold text-brand-offwhite" />
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted" size={16} />
           </div>
           <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg p-1 flex">
             <button className="px-4 py-1.5 text-sm font-medium text-brand-offwhite-muted hover:text-brand-offwhite">Weekly</button>
             <button className="px-4 py-1.5 text-sm font-medium text-brand-offwhite-muted hover:text-brand-offwhite">Monthly</button>
             <button className="px-4 py-1.5 text-sm font-medium bg-brand-charcoal-hover text-brand-offwhite rounded shadow-sm border border-brand-charcoal-border">All Time</button>
           </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-charcoal-border text-xs uppercase tracking-wider text-brand-offwhite-muted font-medium">
              <th className="px-6 py-4 w-16 text-center">Rank</th>
              <th className="px-2 py-4 w-10 text-center">ᐃ</th>
              <th className="px-4 py-4">Student</th>
              <th className="px-6 py-4 text-right">XP</th>
              <th className="px-6 py-4 text-center">Solved</th>
              <th className="px-6 py-4 text-right">Best Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-charcoal-border/50">
            {fullLeaderboard.map((user) => (
              <tr key={user.rank} className={cn(
                "group transition-colors", 
                user.isMe ? "bg-brand-charcoal-hover border-l-2 border-l-brand-muted-gold" : "hover:bg-brand-charcoal-hover/50"
              )}>
                <td className="px-6 py-4">
                  <div className={cn("w-8 h-8 mx-auto rounded flex items-center justify-center font-mono text-sm font-bold", 
                    user.rank === 1 ? "bg-brand-muted-gold/20 text-brand-muted-gold" : 
                    user.rank === 2 ? "bg-brand-offwhite-muted/20 text-brand-offwhite" : 
                    user.rank === 3 ? "bg-[#E07A5F]/20 text-[#E07A5F]" : "text-brand-offwhite-muted"
                  )}>
                    {user.rank}
                  </div>
                </td>
                <td className="px-2 py-4 text-center">
                   {user.delta === 0 ? <Minus size={16} className="text-brand-offwhite-muted mx-auto" /> : 
                    user.delta > 0 ? <div className="flex items-center justify-center text-brand-success gap-0.5"><TrendingUp size={14}/> <span className="text-xs font-bold">{user.delta}</span></div> :
                    <div className="flex items-center justify-center text-brand-error gap-0.5"><TrendingDown size={14}/> <span className="text-xs font-bold">{Math.abs(user.delta)}</span></div>
                   }
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner", getUserColor(user.colIdx))}>
                      {user.initials}
                    </div>
                    <div>
                      <div className="font-bold text-brand-offwhite flex items-center gap-2">
                        {user.name} 
                        {user.isMe && <span className="bg-brand-muted-gold/10 text-brand-muted-gold text-[10px] px-1.5 py-0.5 rounded border border-brand-muted-gold/30 uppercase tracking-wider">You</span>}
                      </div>
                      <div className="text-xs text-brand-offwhite-muted font-mono">{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-1.5 text-brand-muted-gold font-bold">
                    <svg width="10" height="12" viewBox="0 0 12 16" fill="currentColor">
                      <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                    </svg>
                    {user.xp.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-brand-offwhite">
                    <CheckCircle2 size={16} className="text-brand-success" />
                    {user.solved}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-[#8DB4B9]">
                  <div className="flex items-center justify-end gap-2">
                    <Clock size={14} className="opacity-70"/> {user.time.toFixed(1)}ms
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
