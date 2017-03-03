package org.magcruise.citywalk.model.row;

import java.util.Date;
import java.util.Locale;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.relation.UserAccountsTable;

import net.sf.persist.annotations.NoColumn;
import net.sf.persist.annotations.Table;

@Table(name = UserAccountsTable.TABLE_NAME)
public class UserAccount {

	private String id;
	private int pin;
	private String language;
	private String environment;
	private Date createdAt;

	public UserAccount() {
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

	public void setCreatedAt(Date created) {
		this.createdAt = created;
	}

	@NoColumn
	public Locale getLocale() {
		try {
			return Locale.forLanguageTag(language);
		} catch (Throwable t) {
			return Locale.US;
		}
	}

	public int getPin() {
		return pin;
	}

	public void setPin(int pin) {
		this.pin = pin;
	}

	public String getEnvironment() {
		return environment;
	}

	public void setEnvironment(String userAgent) {
		this.environment = userAgent;
	}

	public boolean validate(int pin) {
		return this.pin == pin;
	}

}
