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

package com.google.sps.servlets;
import com.google.gson.Gson;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;

import com.google.cloud.language.v1.Document;
import com.google.cloud.language.v1.LanguageServiceClient;
import com.google.cloud.language.v1.Sentiment;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.List;
import java.util.ArrayList;

/** Servlet that returns comments */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<Comment> comments = new ArrayList<>();
    LanguageServiceClient languageService = LanguageServiceClient.create();
    float sentimentSum = 0;

    for (Entity entity : results.asIterable()) {
      String firstName = (String) entity.getProperty("firstName");
      String lastName = (String) entity.getProperty("lastName");
      String message = (String) entity.getProperty("message");
      long timestamp = (long) entity.getProperty("timestamp");
      Comment comment = new Comment(firstName,lastName,message,timestamp);

      Document doc = Document.newBuilder().setContent(message).setType(Document.Type.PLAIN_TEXT).build();
      Sentiment sentiment = languageService.analyzeSentiment(doc).getDocumentSentiment();
      sentimentSum += sentiment.getScore();

      comments.add(comment);
    }
    languageService.close();

    float avgSentiment = comments.size() == 0 ? 0 : sentimentSum / comments.size();
    JsonResponse jr = new JsonResponse(comments,avgSentiment);
    response.setContentType("application/json;");
    response.getWriter().println(getJson(jr));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Entity newComment = getComment(request);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(newComment);
    response.sendRedirect("/index.html");
  }

  public Entity getComment(HttpServletRequest request) {
    String firstName = request.getParameter("inputFirstName");
    String lastName = request.getParameter("inputLastName");
    String message = request.getParameter("inputComment");
    Entity commentEntity = new Entity("Comment");
    commentEntity.setProperty("firstName",firstName);
    commentEntity.setProperty("lastName",lastName);
    commentEntity.setProperty("message",message);
    commentEntity.setProperty("timestamp",System.currentTimeMillis());
    
    return commentEntity;
  }
  
  public String getJson(JsonResponse jr) {
    return (new Gson()).toJson(jr);
  }
}

class Comment {
  public String firstName, lastName, message;
  public long timestamp;

  public Comment(String firstName, String lastName, String message, long timestamp) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.message = message;
    this.timestamp = timestamp;
  }
}

class JsonResponse {
    public List<Comment> comments;
    public float avgScore;
    public JsonResponse(List<Comment> comments, float avgScore) {
        this.comments = comments;
        this.avgScore = avgScore;
    }
}