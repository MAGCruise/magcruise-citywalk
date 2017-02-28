package org.magcruise.citywalk.model.row;

import java.util.Date;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.relation.UserAccountsTable;

import net.sf.persist.annotations.Table;

@Table(name = UserAccountsTable.TABLE_NAME)
public class UserAccount {

	private String id;
	private String language;
	private Date createdAt;

	public UserAccount() {
	}

	public UserAccount(String userId, String language) {
		this.id = userId;
		this.language = language;
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

}
