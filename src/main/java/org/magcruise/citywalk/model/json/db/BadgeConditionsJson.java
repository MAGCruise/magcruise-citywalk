package org.magcruise.citywalk.model.json.db;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class BadgeConditionsJson {

	private List<BadgeConditionJson> badgeConditions = new ArrayList<>();

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public List<BadgeConditionJson> getBadgeConditions() {
		return badgeConditions;
	}

	public void setBadgeConditions(List<BadgeConditionJson> badgeConditions) {
		this.badgeConditions = badgeConditions;
	}

}
