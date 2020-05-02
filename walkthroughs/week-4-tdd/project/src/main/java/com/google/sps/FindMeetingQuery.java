// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    // duration is longer than an entire day
    if(request.getDuration() >= TimeRange.END_OF_DAY)
        return new ArrayList<TimeRange>();
    
    // put events into a list so we can sort and index them
    // also stores when the last end time is
    ArrayList<Event> eventsList = new ArrayList<>();
    int lastEndTime = -1;
    for(Event e: events) {
        eventsList.add(e);
        lastEndTime = Math.max(lastEndTime,e.getWhen().end());
    }

    // comparator to sort events by start of their time range
    Comparator<Event> comp = new Comparator<Event>() {
        @Override
        public int compare(Event a, Event b) {
            return TimeRange.ORDER_BY_START.compare(a.getWhen(),b.getWhen());
        }
    };
    
    Collections.sort(eventsList,comp);

    // list to store time ranges that we cannot hold meetings
    List<TimeRange> unavailableTimes = getUnavailableTimes(eventsList,request);

    // list that holds the return value (open meeting times)
    Collection<TimeRange> meetingTimes = new ArrayList<>();
    
    // loops through unavailable times and sees if there are times inbetween them to hold the meeting
    int start = 0;
    for(int i = 0; i < unavailableTimes.size(); i++) {
        TimeRange t = unavailableTimes.get(i);
        TimeRange meeting = TimeRange.fromStartEnd(start,t.start(),false);
        // if there is enough time from start until the next meeting, add it
        if(meeting.duration() >= request.getDuration())
            meetingTimes.add(meeting);
        // set start to the next available time (the end of the unavailable time)
        start = t.end();
    }

    // check last event time until the end of the day
    if(unavailableTimes.size() > 0) {
        TimeRange meeting = TimeRange.fromStartEnd(lastEndTime,TimeRange.END_OF_DAY,true);
        if(meeting.duration() >= request.getDuration())
            meetingTimes.add(meeting);
    }
    // this means there are no unavailable times so only add the whole day
    else {
        meetingTimes.add(TimeRange.fromStartEnd(0,TimeRange.END_OF_DAY,true));
    }

    return meetingTimes;
  }

  public List<TimeRange> getUnavailableTimes(List<Event> eventsList, MeetingRequest request) {
    List<TimeRange> unavailableTimes = new ArrayList<>();
    for(int i = 0; i < eventsList.size(); i++) {
        Event currEvent = eventsList.get(i);
        boolean available = true;
        for(String attendee: currEvent.getAttendees()) {
            if(request.getAttendees().contains(attendee)) { 
                available = false;
                break;
            }
        }

        // if no one from the request is at this event, then its available so we skip it
        if(available)
            continue;

        // this finds the longest contiguous block that is unavailable by checking if the next
        // event overlaps
        int start = currEvent.getWhen().start();
        int end = currEvent.getWhen().end();
        if(i != eventsList.size()-1) {
            Event nextEvent = eventsList.get(i+1);
            while(currEvent.getWhen().overlaps(nextEvent.getWhen())) {
                end = Math.max(end,nextEvent.getWhen().end());
                i++;
                if(i == eventsList.size()-1)
                    break;
                nextEvent = eventsList.get(i+1);
            }
        }
        unavailableTimes.add(TimeRange.fromStartEnd(start,end,false));
    }
    return unavailableTimes;
  }
}
