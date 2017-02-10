package org.magcruise.citywalk.model.row;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.relation.CoursesTable;

import net.sf.persist.annotations.Table;

@Table(name = CoursesTable.TABLE_NAME)
public class Course {

	private String id;
	private String name;
	private int maxCategoryDepth;
	private boolean disabled;

	public Course() {
	}

	public Course(String id, String name, int maxCategoryDepth, boolean disabled) {
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

	public void setName(String badges) {
		this.name = badges;
	}

	public int getMaxCategoryDepth() {
		return maxCategoryDepth;
	}

	public void setMaxCategoryDepth(int userId) {
		this.maxCategoryDepth = userId;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public boolean getDisabled() {
		return disabled;
	}

	public void setDisabled(boolean disabled) {
		this.disabled = disabled;
	}

}
