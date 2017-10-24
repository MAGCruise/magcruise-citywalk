package org.magcruise.citywalk.model.json.app;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class CategoriesJson {

	private List<CategoryDefinitionJson> categories = new ArrayList<>();

	public List<CategoryDefinitionJson> getCategories() {
		return categories;
	}

	public void setCategories(List<CategoryDefinitionJson> categories) {
		this.categories = categories;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

}
