package org.magcruise.citywalk.model.json.app;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class BadgeDefinitionsJson {

	private List<BadgeDefinitionJson> badgeDefinitions = new ArrayList<>();

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public List<BadgeDefinitionJson> getBadgeDefinitions() {
		return badgeDefinitions;
	}

	public void setBadgeDefinitions(List<BadgeDefinitionJson> badgeConditions) {
		this.badgeDefinitions = badgeConditions;
	}

}
