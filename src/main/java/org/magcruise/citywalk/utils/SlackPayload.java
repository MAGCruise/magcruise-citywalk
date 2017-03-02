package org.magcruise.citywalk.utils;

import org.nkjmlab.util.json.JsonUtils;

public class SlackPayload {
	private String channel;
	private String username;
	private String text;
	private String icon_emoji;

	public SlackPayload() {
	}

	public SlackPayload(String channel, String username, String text, String icon_emoji) {
		this.channel = channel;
		this.username = username;
		this.text = text;
		this.icon_emoji = icon_emoji;
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

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public String getIcon_emoji() {
		return icon_emoji;
	}

	public void setIcon_emoji(String icon_emoji) {
		this.icon_emoji = icon_emoji;
	}

	public String toJson() {
		return JsonUtils.encode(this);
	}
}