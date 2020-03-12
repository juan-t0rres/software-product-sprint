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
    if(request.getDuration() >= TimeRange.END_OF_DAY) {
        return new ArrayList<TimeRange>();
    }
    
    int lastEndTime = -1;
    // put events into a list so we can sort and index them
    ArrayList<Event> eventsList = new ArrayList<>();
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
    List<TimeRange> unavailableTimes = new ArrayList<>();
    for(int i = 0; i < eventsList.size(); i++) {
        Event currEvent = eventsList.get(i);
        boolean weGood = true;
        for(String attendee: currEvent.getAttendees()) {
            if(request.getAttendees().contains(attendee)) { 
                weGood = false;
                break;
            }
        }

        if(weGood)
            continue;
        
        int start = currEvent.getWhen().start();
        int end = currEvent.getWhen().end();

        if(i != events.size()-1) {
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

    // list that holds the return value (open meeting times)
    Collection<TimeRange> meetingTimes = new ArrayList<>();
    
    int start = 0;
    // loops through unavailable times and sees if there are times inbetween them to hold the meeting
    for(int i = 0; i < unavailableTimes.size(); i++) {
        TimeRange uTime = unavailableTimes.get(i);
        TimeRange meeting = TimeRange.fromStartEnd(start,uTime.start(),false);
        if(meeting.duration() >= request.getDuration()) {
            meetingTimes.add(meeting);
        }
        start = uTime.end();
    }
    // check last event time until the end of the day
    if(unavailableTimes.size() > 0) {
        TimeRange meeting = TimeRange.fromStartEnd(lastEndTime,TimeRange.END_OF_DAY,true);
        if(meeting.duration() >= request.getDuration()) {
            meetingTimes.add(meeting);
        }
    }
    else {
        // this means there are no unavailable times
        meetingTimes.add(TimeRange.fromStartEnd(0,TimeRange.END_OF_DAY,true));
    }

    return meetingTimes;
  }
}
