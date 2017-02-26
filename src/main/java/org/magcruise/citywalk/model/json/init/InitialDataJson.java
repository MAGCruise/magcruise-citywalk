package org.magcruise.citywalk.model.json.init;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class InitialDataJson {

	private List<CheckpointJson> checkpoints = new ArrayList<>();
	private List<CategoryJson> categories = new ArrayList<>();
	private CoursesJson settings = new CoursesJson();

	public InitialDataJson(List<CheckpointJson> checkpointsJson,
			List<CategoryJson> categoriesJson) {
		this.checkpoints.addAll(checkpointsJson);
		this.categories.addAll(categoriesJson);
	}

	public List<CheckpointJson> getCheckpoints() {
		return checkpoints;
	}

	public void setCheckpoints(List<CheckpointJson> elements) {
		this.checkpoints = elements;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public List<CategoryJson> getCategories() {
		return categories;
	}

	public void setCategories(List<CategoryJson> categories) {
		this.categories = categories;
	}

	public CoursesJson getSettings() {
		return settings;
	}

	public void setSettings(CoursesJson settings) {
		this.settings = settings;
	}

}
