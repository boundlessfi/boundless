import { Activity } from '@/types/user';
import React, { useMemo } from 'react';

interface ActivityHeatmapProps {
  activities?: Activity[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activities = [],
}) => {
  const { activityData, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const activityMap = new Map<string, number>();

    activities.forEach(activity => {
      if (!activity.createdAt) return;

      try {
        const date = new Date(activity.createdAt);
        if (isNaN(date.getTime()) || date < oneYearAgo || date > today) return;

        date.setHours(0, 0, 0, 0);
        const dateKey = date.toISOString().split('T')[0];
        activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
      } catch {
        return;
      }
    });

    const data: Array<{ date: Date; count: number }> = [];
    const currentDate = new Date(oneYearAgo);

    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      data.push({
        date: new Date(currentDate),
        count: activityMap.get(dateKey) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalCount = data.reduce((sum, day) => sum + day.count, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const currentWeekCount = data
      .filter(day => day.date >= sevenDaysAgo)
      .reduce((sum, day) => sum + day.count, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthCount = data
      .filter(day => day.date >= firstDayOfMonth)
      .reduce((sum, day) => sum + day.count, 0);

    const todayCount =
      data.find(day => day.date.toDateString() === today.toDateString())
        ?.count || 0;

    const avgPerDay =
      data.length > 0 ? (totalCount / data.length).toFixed(1) : '0.0';

    const mostActiveDay = data.reduce(
      (max, day) => (day.count > max.count ? day : max),
      { date: new Date(), count: 0 }
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].count > 0) {
        currentStreak++;
      } else if (data[i].date < today) {
        break;
      }
    }

    data.forEach(day => {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    return {
      activityData: data,
      stats: {
        total: totalCount,
        currentWeek: currentWeekCount,
        currentMonth: currentMonthCount,
        today: todayCount,
        avgPerDay,
        mostActiveDay,
        currentStreak,
        longestStreak,
      },
    };
  }, [activities]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-zinc-900';
    if (count <= 2) return 'bg-emerald-900/40';
    if (count <= 4) return 'bg-emerald-700/60';
    if (count <= 6) return 'bg-emerald-600/80';
    return 'bg-emerald-500';
  };

  const weeks = useMemo(() => {
    const weeksArray: ((typeof activityData)[0] | null)[][] = [];
    let currentWeek: ((typeof activityData)[0] | null)[] = [];

    const firstDate = activityData[0].date;
    const firstDay = firstDate.getDay();

    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    activityData.forEach(day => {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeksArray.push([...currentWeek]);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [activityData]);

  const monthLabels = useMemo(() => {
    const months: Array<{ label: string; weekIndex: number }> = [];
    let currentMonth: number | null = null;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week.find(day => day !== null);
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== currentMonth) {
          months.push({
            label: firstDay.date.toLocaleDateString('en-US', {
              month: 'short',
            }),
            weekIndex,
          });
          currentMonth = month;
        }
      }
    });

    return months;
  }, [weeks]);

  return (
    <div className='w-full space-y-6'>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8'>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-4'>
          <div className='text-xs text-zinc-400 sm:text-sm'>Today</div>
          <div className='mt-1 text-xl font-bold text-white sm:text-2xl'>
            {stats.today}
          </div>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-4'>
          <div className='text-xs text-zinc-400 sm:text-sm'>This Week</div>
          <div className='mt-1 text-xl font-bold text-white sm:text-2xl'>
            {stats.currentWeek}
          </div>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-4'>
          <div className='text-xs text-zinc-400 sm:text-sm'>This Month</div>
          <div className='mt-1 text-xl font-bold text-white sm:text-2xl'>
            {stats.currentMonth}
          </div>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-4'>
          <div className='text-xs text-zinc-400 sm:text-sm'>Total</div>
          <div className='mt-1 text-xl font-bold text-white sm:text-2xl'>
            {stats.total}
          </div>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-4'>
          <div className='text-xs text-zinc-400 sm:text-sm'>Avg/Day</div>
          <div className='mt-1 text-xl font-bold text-white sm:text-2xl'>
            {stats.avgPerDay}
          </div>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-4'>
          <div className='text-xs text-zinc-400 sm:text-sm'>Current Streak</div>
          <div className='mt-1 text-xl font-bold text-emerald-500 sm:text-2xl'>
            {stats.currentStreak}
          </div>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-4'>
          <div className='text-xs text-zinc-400 sm:text-sm'>Longest Streak</div>
          <div className='mt-1 text-xl font-bold text-emerald-500 sm:text-2xl'>
            {stats.longestStreak}
          </div>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-4'>
          <div className='text-xs text-zinc-400 sm:text-sm'>Best Day</div>
          <div className='mt-1 text-xl font-bold text-white sm:text-2xl'>
            {stats.mostActiveDay.count}
          </div>
          <div className='mt-1 text-[10px] text-zinc-500'>
            {stats.mostActiveDay.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      <div className='w-full max-w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-6'>
        <h3 className='mb-2 text-lg font-semibold text-white sm:text-xl'>
          {stats.total} contributions in the last year
        </h3>
        <p className='mb-4 text-xs text-zinc-400 sm:mb-6 sm:text-sm'>
          Track your hackathon journey - participations, submissions, and
          community engagement
        </p>

        <div className='w-full overflow-x-auto'>
          <div className='min-w-max sm:min-w-0'>
            <div className='relative mb-4 flex' style={{ paddingLeft: '36px' }}>
              {monthLabels.map((month, index) => (
                <div
                  key={index}
                  className='text-xs whitespace-nowrap text-zinc-400'
                  style={{
                    position: 'absolute',
                    left: `${36 + month.weekIndex * 12}px`,
                    top: '-2px',
                  }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            <div className='flex gap-1'>
              <div
                className='flex flex-col gap-1 pr-2 text-xs text-zinc-400'
                style={{ minWidth: '36px' }}
              >
                <div
                  className='text-[10px] sm:text-xs'
                  style={{ height: '8px', lineHeight: '8px' }}
                >
                  Sun
                </div>
                <div
                  className='text-[10px] sm:text-xs'
                  style={{ height: '8px', lineHeight: '8px' }}
                >
                  Mon
                </div>
                <div
                  className='text-[10px] sm:text-xs'
                  style={{ height: '8px', lineHeight: '8px' }}
                >
                  Tue
                </div>
                <div
                  className='text-[10px] sm:text-xs'
                  style={{ height: '8px', lineHeight: '8px' }}
                >
                  Wed
                </div>
                <div
                  className='text-[10px] sm:text-xs'
                  style={{ height: '8px', lineHeight: '8px' }}
                >
                  Thu
                </div>
                <div
                  className='text-[10px] sm:text-xs'
                  style={{ height: '8px', lineHeight: '8px' }}
                >
                  Fri
                </div>
                <div
                  className='text-[10px] sm:text-xs'
                  style={{ height: '8px', lineHeight: '8px' }}
                >
                  Sat
                </div>
              </div>

              <div className='flex gap-1'>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className='flex flex-col gap-1'>
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`h-[8px] w-[8px] cursor-pointer rounded-sm transition-all hover:ring-1 hover:ring-emerald-400 sm:h-[10px] sm:w-[10px] ${
                          day ? getIntensityClass(day.count) : 'bg-transparent'
                        }`}
                        title={
                          day
                            ? `${day.date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}: ${day.count} ${day.count === 1 ? 'contribution' : 'contributions'}`
                            : ''
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-4 flex flex-col items-start justify-between gap-3 text-xs text-zinc-400 sm:flex-row sm:items-center sm:gap-0'>
              <div className='flex items-center gap-3'>
                <span className='text-[10px] text-zinc-500 italic sm:text-xs'>
                  Inspired by GitHub
                </span>
                {stats.currentStreak > 0 && (
                  <div className='flex items-center gap-1.5 rounded-md bg-zinc-900 px-2 py-1'>
                    <span className='text-[10px] font-medium text-emerald-500 sm:text-xs'>
                      🔥 {stats.currentStreak} day streak
                    </span>
                  </div>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] sm:text-xs'>Less</span>
                <div className='flex gap-0.5 sm:gap-1'>
                  <div className='h-[8px] w-[8px] rounded-sm border border-zinc-800 bg-zinc-900 sm:h-[10px] sm:w-[10px]'></div>
                  <div className='h-[8px] w-[8px] rounded-sm bg-emerald-900/40 sm:h-[10px] sm:w-[10px]'></div>
                  <div className='h-[8px] w-[8px] rounded-sm bg-emerald-700/60 sm:h-[10px] sm:w-[10px]'></div>
                  <div className='h-[8px] w-[8px] rounded-sm bg-emerald-600/80 sm:h-[10px] sm:w-[10px]'></div>
                  <div className='h-[8px] w-[8px] rounded-sm bg-emerald-500 sm:h-[10px] sm:w-[10px]'></div>
                </div>
                <span className='text-[10px] sm:text-xs'>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
