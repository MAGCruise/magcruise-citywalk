package org.magcruise.citywalk.model.json;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.row.UserAccount;

public class UserAccountJson {

	private String id;
	private String pin;
	private String language;
	private String environment;
	private long createdAt;

	public UserAccountJson() {
	}

	public UserAccountJson(UserAccount ua) {
		this.id = ua.getId();
		this.pin = ua.getPin();
		this.language = ua.getLanguage();
		this.environment = ua.getEnvironment();
		this.createdAt = ua.getCreatedAt().getTime();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String groupId) {
		this.language = groupId;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public long getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(long createdAt) {
		this.createdAt = createdAt;
	}

	public String getPin() {
		return pin;
	}

	public void setPin(String pin) {
		this.pin = pin;
	}

	public String getEnvironment() {
		return environment;
	}

	public void setEnvironment(String userAgent) {
		this.environment = userAgent;
	}

	public boolean validate(String pin) {
		return this.pin.equals(pin);
	}

}
