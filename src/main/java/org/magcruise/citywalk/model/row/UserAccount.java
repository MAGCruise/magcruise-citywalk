package org.magcruise.citywalk.model.row;

import java.util.Date;
import java.util.Locale;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.json.UserAccountJson;
import org.magcruise.citywalk.model.relation.UserAccountsTable;

import net.sf.persist.annotations.NoColumn;
import net.sf.persist.annotations.Table;

@Table(name = UserAccountsTable.TABLE_NAME)
public class UserAccount {

	private String id;
	private String pin;
	private String language;
	private String environment;
	private Date createdAt;

	public UserAccount() {
	}

	public UserAccount(UserAccountJson ua) {
		this.id = ua.getId();
		this.pin = ua.getPin();
		this.language = ua.getLanguage();
		this.environment = ua.getEnvironment();
		this.createdAt = new Date(ua.getCreatedAt());
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

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	@NoColumn
	public Locale getLocale() {
		try {
			return Locale.forLanguageTag(language);
		} catch (Throwable t) {
			return Locale.US;
		}
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
