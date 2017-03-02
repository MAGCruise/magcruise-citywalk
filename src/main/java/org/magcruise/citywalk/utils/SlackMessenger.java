package org.magcruise.citywalk.utils;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.apache.http.HttpStatus;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.logging.log4j.Logger;
import org.nkjmlab.util.log4j.LogManager;
import org.nkjmlab.util.net.UrlUtils;

public class SlackMessenger {
	protected static Logger log = LogManager.getLogger();

	private URL postUrl;
	private String channel;
	private String username;
	private String emojiIcon = ":ghost:";

	public SlackMessenger(URL postUrl, String channel, String username) {
		this.postUrl = postUrl;
		this.channel = channel;
		this.username = username;
	}

	public SlackMessenger(String postUrl, String channel, String username) {
		this(UrlUtils.of(postUrl), channel, username);
	}

	public void postMessage(String text) {
		postToChannel(postUrl, new SlackPayload(channel, username, text, emojiIcon));
	}

	public static void postToChannel(URL postUrl, SlackPayload payload) {
		try (CloseableHttpClient client = HttpClients.createDefault()) {
			HttpPost post = new HttpPost(postUrl.toString());
			post.setEntity(new StringEntity(payload.toJson(), StandardCharsets.UTF_8));
			try (CloseableHttpResponse response = client.execute(post)) {
				if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
					//HttpEntity entity = response.getEntity();
					//System.out.println(EntityUtils.toString(entity, StandardCharsets.UTF_8));
				}
			}
		} catch (IOException e) {
			log.warn(e.getMessage());
		}
	}

	public URL getPostUrl() {
		return postUrl;
	}

	public void setPostUrl(URL postUrl) {
		this.postUrl = postUrl;
	}

	public String getChannel() {
		return channel;
	}

	public void setChannel(String channel) {
		this.channel = channel;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmojiIcon() {
		return emojiIcon;
	}

	public void setEmojiIcon(String emojiIcon) {
		this.emojiIcon = emojiIcon;
	}

}