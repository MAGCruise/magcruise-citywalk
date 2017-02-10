package org.magcruise.citywalk.model.row;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.relation.BadgeConditionsTable;

import net.sf.persist.annotations.Column;
import net.sf.persist.annotations.Table;

@Table(name = BadgeConditionsTable.TABLE_NAME)
public class BadgeCondition {

	private long id;
	private String courseId;
	private String name;
	private String imgSrc;
	private String type;
	private String value;

	public BadgeCondition() {
	}

	public BadgeCondition(String courseId, String name, String imgSrc, String type, String value) {
		this.courseId = courseId;
		this.name = name;
		this.imgSrc = imgSrc;
		this.type = type;
		this.value = value;
	}

	public String getImgSrc() {
		return imgSrc;
	}

	public void setImgSrc(String imgSrc) {
		this.imgSrc = imgSrc;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	@Column(autoGenerated = true)
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCourseId() {
		return courseId;
	}

	public void setCourseId(String course) {
		this.courseId = course;
	}

}
