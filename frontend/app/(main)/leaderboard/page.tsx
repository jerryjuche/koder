'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Search, CheckCircle2, Clock } from 'lucide-react';
import { fetchLeaderboard, fetchUser } from '@/lib/api';
import { LeaderboardEntry, User } from '@/lib/types';
import { cn, getUserColor } from '@/lib/utils';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchLeaderboard(), fetchUser()]).then(([lbRes, userRes]) => {
      if (lbRes.success) setLeaderboard(lbRes.data || []);
      if (userRes.success) setUser(userRes.data);
      setLoading(false);
    });
  }, []);


  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-brand-charcoal-card border border-brand-charcoal-border shadow-lg">
          <Trophy size={32} className="text-brand-muted-gold" />
        </div>
        <h1 className="text-4xl font-bold text-brand-offwhite">Leaderboard</h1>
        <p className="text-brand-offwhite-muted">{leaderboard.length} students competing · Updated live</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center gap-6 items-end mt-12 mb-8">
        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
           if(!entry || !entry.user) return null;
           const user = entry.user;
           const isFirst = i === 1;
           const isSecond = i === 0;
           const rank = isFirst ? 1 : isSecond ? 2 : 3;
           const initials = user?.name ? user.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'U';
           
           return (
             <div key={rank} className={cn(
               "flex flex-col items-center p-6 bg-brand-charcoal-card border rounded-2xl shadow-lg relative transition-transform hover:-translate-y-2",
               isFirst ? "border-brand-muted-gold/50 w-72 h-44 shadow-brand-muted-gold/10" : "border-brand-charcoal-border w-64 h-36"
             )}>
                <div className={cn("absolute -top-6 w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-inner text-white border-4 border-brand-charcoal-base", getUserColor(user?.avatarIndex || 0))}>
                  {initials}
                </div>
                <div className="mt-8 text-center">
                  <div className={cn("font-bold", isFirst ? "text-xl text-brand-offwhite" : "text-lg text-brand-offwhite-muted")}>{user?.name || 'Unknown'}</div>
                  <div className="flex items-center justify-center gap-1 text-brand-muted-gold font-bold mt-2">
                    <svg width="10" height="12" viewBox="0 0 12 16" fill="currentColor">
                      <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                    </svg>
                    {(user?.xp || 0).toLocaleString()}
                  </div>
                  <div className="bg-brand-charcoal-hover text-brand-offwhite-muted text-xs font-bold px-3 py-1 rounded w-max mx-auto mt-3">
                    {rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'}
                  </div>
                </div>
             </div>
           );
        })}
      </div>

      {/* Current User Stats Bar */}
      {user && (
      <div className="bg-gradient-to-r from-brand-charcoal-base to-brand-charcoal-card border border-brand-muted-gold/30 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-brand-muted-gold/5">
        <div className="flex items-center gap-5">
           <div className="w-10 h-10 rounded-full bg-brand-charcoal-base border border-brand-charcoal-border flex items-center justify-center font-mono font-bold text-brand-offwhite-muted">
             {leaderboard.findIndex(e => e.user.id === user.id) !== -1 ? leaderboard.findIndex(e => e.user.id === user.id) + 1 : '-'}
           </div>
           <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-inner", getUserColor(user.avatarIndex))}>
             {user.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()}
           </div>
           <div>
             <div className="text-sm font-medium text-brand-muted-gold">Your Ranking</div>
             <div className="text-xl font-bold text-brand-offwhite font-sans">{user.name}</div>
           </div>
        </div>
        <div className="flex items-center gap-8 text-right">
          <div>
            <div className="text-xl font-bold text-brand-muted-gold">{user.xp.toLocaleString()}</div>
            <div className="text-xs text-brand-offwhite-muted font-medium uppercase tracking-wider">XP</div>
          </div>
          <div>
            <div className="text-xl font-bold text-brand-offwhite">{user.solvedCount}</div>
            <div className="text-xs text-brand-offwhite-muted font-medium uppercase tracking-wider">Solved</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#8DB4B9]">
               {(leaderboard.find(e => e.user.id === user.id)?.bestTimeMs || 0).toFixed(1)}ms
            </div>
            <div className="text-xs text-brand-offwhite-muted font-medium uppercase tracking-wider">Best</div>
          </div>
        </div>
      </div>
      )}

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
            {leaderboard.map((entry, idx) => {
              const rank = idx + 1;
              const rowUser = entry.user;
              const initials = rowUser?.name ? rowUser.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'U';
              const isMe = user?.id === rowUser?.id;
              
              return (
              <tr key={rowUser?.id || idx} className={cn(
                "group transition-colors", 
                isMe ? "bg-brand-charcoal-hover border-l-2 border-l-brand-muted-gold" : "hover:bg-brand-charcoal-hover/50"
              )}>
                <td className="px-6 py-4">
                  <div className={cn("w-8 h-8 mx-auto rounded flex items-center justify-center font-mono text-sm font-bold", 
                    rank === 1 ? "bg-brand-muted-gold/20 text-brand-muted-gold" : 
                    rank === 2 ? "bg-brand-offwhite-muted/20 text-brand-offwhite" : 
                    rank === 3 ? "bg-[#E07A5F]/20 text-[#E07A5F]" : "text-brand-offwhite-muted"
                  )}>
                    {rank}
                  </div>
                </td>
                <td className="px-2 py-4 text-center">
                   {entry.rankDelta === 0 ? <Minus size={16} className="text-brand-offwhite-muted mx-auto" /> : 
                    entry.rankDelta > 0 ? <div className="flex items-center justify-center text-brand-success gap-0.5"><TrendingUp size={14}/> <span className="text-xs font-bold">{entry.rankDelta}</span></div> :
                    <div className="flex items-center justify-center text-brand-error gap-0.5"><TrendingDown size={14}/> <span className="text-xs font-bold">{Math.abs(entry.rankDelta)}</span></div>
                   }
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner", getUserColor(rowUser?.avatarIndex || 0))}>
                      {initials}
                    </div>
                    <div>
                      <div className="font-bold text-brand-offwhite flex items-center gap-2">
                        {rowUser?.name || 'Unknown'} 
                        {isMe && <span className="bg-brand-muted-gold/10 text-brand-muted-gold text-[10px] px-1.5 py-0.5 rounded border border-brand-muted-gold/30 uppercase tracking-wider">You</span>}
                      </div>
                      <div className="text-xs text-brand-offwhite-muted font-mono">{rowUser?.studentId || ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-1.5 text-brand-muted-gold font-bold">
                    <svg width="10" height="12" viewBox="0 0 12 16" fill="currentColor">
                      <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                    </svg>
                    {(rowUser?.xp || 0).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-brand-offwhite">
                    <CheckCircle2 size={16} className="text-brand-success" />
                    {rowUser?.solvedCount || 0}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-[#8DB4B9]">
                  <div className="flex items-center justify-end gap-2">
                    <Clock size={14} className="opacity-70"/> {(entry.bestTimeMs || 0).toFixed(1)}ms
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
