'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutList, CalendarDays, CalendarRange } from 'lucide-react';
import { format, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { useAppointments } from '../appointment.hooks';
import { AppointmentList } from './appointment-list';
import { AppointmentDayView } from './appointment-day-view';
import { AppointmentWeekView } from './appointment-week-view';

type ViewMode = 'list' | 'day' | 'week';

export function AppointmentCalendar() {
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

  // Fetch a larger limit for calendar views to ensure all appointments are loaded for the day/week
  // In a real prod environment, we would use dateFrom and dateTo based on the view
  const { data, isLoading } = useAppointments({
    limit: 500, // Large enough to cover a week
    // dateFrom: format(startOfWeek, 'yyyy-MM-dd')
    // dateTo: format(endOfWeek, 'yyyy-MM-dd')
  });

  const appointments = data?.data || [];

  const handlePrevious = () => {
    if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getHeaderTitle = () => {
    if (viewMode === 'day') return format(currentDate, 'MMMM d, yyyy');
    if (viewMode === 'week') {
      return `Week of ${format(currentDate, 'MMM d, yyyy')}`;
    }
    return 'All Appointments';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-2 rounded-lg border">
        
        <div className="flex items-center space-x-2">
          {viewMode !== 'list' && (
            <>
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold w-[200px] text-center">
                {getHeaderTitle()}
              </h2>
            </>
          )}
        </div>

        <div className="flex items-center p-1 bg-background rounded-md border shadow-sm">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="w-24"
          >
            <LayoutList className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('day')}
            className="w-24"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Day
          </Button>
          <Button
            variant={viewMode === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
            className="w-24"
          >
            <CalendarRange className="h-4 w-4 mr-2" />
            Week
          </Button>
        </div>
      </div>

      {/* Views */}
      <div className="min-h-[500px]">
        {viewMode === 'list' && <AppointmentList />}
        {viewMode === 'day' && (
          <AppointmentDayView 
            date={currentDate} 
            appointments={appointments} 
            isLoading={isLoading} 
          />
        )}
        {viewMode === 'week' && (
          <AppointmentWeekView 
            currentDate={currentDate} 
            appointments={appointments} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </div>
  );
}
