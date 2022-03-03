package wallOfTweets;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.repackaged.org.json.JSONArray;
import com.google.appengine.repackaged.org.json.JSONException;
import com.google.appengine.repackaged.org.json.JSONObject;



@SuppressWarnings("serial")
@WebServlet(urlPatterns = {"/tweets", "/tweets/*"})
public class WallServlet extends HttpServlet {

	private String TWEETS_URI = "/waslab03/tweets/";

	@Override
	// Implements GET http://localhost:8080/waslab03/tweets
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		resp.setContentType("application/json");
		resp.setHeader("Cache-control", "no-cache");
		List<Tweet> tweets= Database.getTweets();
		JSONArray job = new JSONArray();
		for (Tweet t: tweets) {
			JSONObject jt = new JSONObject(t);
			jt.remove("class");
			job.put(jt);
		}
		resp.getWriter().println(job.toString());
	}

	@Override
	// Implements POST http://localhost:8080/waslab03/tweets/:id/likes
	//        and POST http://localhost:8080/waslab03/tweets
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		String uri = req.getRequestURI();
		int lastIndex = uri.lastIndexOf("/likes");
		if (lastIndex > -1) {  // uri ends with "/likes"
			// Implements POST http://localhost:8080/waslab03/tweets/:id/likes
			long id = Long.valueOf(uri.substring(TWEETS_URI.length(),lastIndex));		
			resp.setContentType("text/plain");
			resp.getWriter().println(Database.likeTweet(id));
		}
		else { 
			// Implements POST http://localhost:8080/waslab03/tweets
			int max_length_of_data = req.getContentLength();
			byte[] httpInData = new byte[max_length_of_data];
			ServletInputStream  httpIn  = req.getInputStream();
			httpIn.readLine(httpInData, 0, max_length_of_data);
			String body = new String(httpInData);
			/*      ^
		      The String variable body contains the sent (JSON) Data. 
		      Complete the implementation below.*/
			try {
				JSONObject newObj = new JSONObject(body);
				String Author = newObj.getString("author");
				String Text = newObj.getString("text");
				Tweet t= Database.insertTweet(Author, Text);
				
				JSONObject newObj2 = new JSONObject(t);
				//String respo = newObj2.toString();
				String token = StringtoHashMD5(Long.toString(t.getId()));
				newObj2.put("token", token);
				resp.getWriter().println(newObj2.toString());
				
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
		}
	}
	
	@Override
	// Implements DELETE http://localhost:8080/waslab03/tweets/:id
	public void doDelete(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, ServletException {
		String uri = req.getRequestURI();
		String token = req.getQueryString();

		token = token.substring(6, token.length());
		
		
		int lastIndex = uri.lastIndexOf("/delete");
		if (lastIndex > -1) {  // uri ends with "/delete"
			// Implements POST http://localhost:8080/waslab03/tweets/:id/delete
			long id = Long.valueOf(uri.substring(uri.length(),lastIndex));
			long id_test = 185;
			String tokenID = StringtoHashMD5(Long.toString(id));
			
			Database.deleteTweet(id_test+4);
			boolean borrat = false;
			if(!token.isEmpty() && tokenID.equals(token)) borrat = Database.deleteTweet(id);
			
			//if(!Database.deleteTweet(id)) {
				
			
			
			if(!borrat)throw new ServletException("DELETE not yet implemented");
			
		}
		
		
		}

	
	String StringtoHashMD5(String s) {
        StringBuffer sb = new StringBuffer();
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(s.getBytes());
            for (int i = 0; i < digest.length; ++i) {
                sb.append(Integer.toHexString((digest[i] & 0xFF) | 0x100).substring(1, 3));
            }

        }
        catch(NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return sb.toString();
    }
}
