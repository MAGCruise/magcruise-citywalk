package org.magcruise.citywalk.model.json.init;

public class CourseJson {

	private String id;
	private String name;
	private int maxCategoryDepth;
	private boolean disabled;

	public CourseJson() {
	}

	public CourseJson(String id, String name, int maxCategoryDepth, boolean disabled) {
		super();
		this.id = id;
		this.name = name;
		this.maxCategoryDepth = maxCategoryDepth;
		this.disabled = disabled;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getMaxCategoryDepth() {
		return maxCategoryDepth;
	}

	public void setMaxCategoryDepth(int maxCategoryDepth) {
		this.maxCategoryDepth = maxCategoryDepth;
	}

	public boolean getDisabled() {
		return disabled;
	}

	public void setDisabled(boolean disabled) {
		this.disabled = disabled;
	}

}
