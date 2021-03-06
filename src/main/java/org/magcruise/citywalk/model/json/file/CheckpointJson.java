package org.magcruise.citywalk.model.json.file;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.row.Checkpoint;
import org.nkjmlab.util.time.DateTimeUtils;

public class CheckpointJson {
	private String id;
	private String name;
	private String label;
	private String description;

	private double lat;
	private double lon;
	private List<String> courseIds = new ArrayList<>();
	private String markerColor;
	private String category;
	private String subcategory;
	private Date visibleTimeFrom = new Date(0);
	private Date visibleTimeTo = DateTimeUtils
			.toDate(DateTimeUtils.parseH2TimestampString("2099-01-01 00:00:00"));
	private String imgSrc;
	private String place;

	public CheckpointJson() {
	}

	public CheckpointJson(String id, String name, String label, String description, double lat,
			double lon, List<String> courseIds, String markerColor, String category,
			String subcategory, String imgSrc, String place) {
		this.id = id;
		this.name = name;
		this.label = label;
		this.description = description;
		this.lat = lat;
		this.lon = lon;
		this.courseIds.addAll(courseIds);
		this.markerColor = markerColor;
		this.category = category;
		this.subcategory = subcategory;
		this.imgSrc = imgSrc;
		this.place = place;
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

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public double getLat() {
		return lat;
	}

	public void setLat(double lat) {
		this.lat = lat;
	}

	public double getLon() {
		return lon;
	}

	public void setLon(double lon) {
		this.lon = lon;
	}

	public List<String> getCourseIds() {
		return courseIds;
	}

	public void setCourseIds(List<String> courseIds) {
		this.courseIds = courseIds;
	}

	public String getMarkerColor() {
		return markerColor;
	}

	public void setMarkerColor(String markerColor) {
		this.markerColor = markerColor;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getSubcategory() {
		return subcategory;
	}

	public void setSubcategory(String subcategory) {
		this.subcategory = subcategory;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public Date getVisibleTimeFrom() {
		return visibleTimeFrom;
	}

	public void setVisibleTimeFrom(Date visibleTimeFrom) {
		this.visibleTimeFrom = visibleTimeFrom;
	}

	public Date getVisibleTimeTo() {
		return visibleTimeTo;
	}

	public void setVisibleTimeTo(Date visibleTimeTo) {
		this.visibleTimeTo = visibleTimeTo;
	}

	public String getImgSrc() {
		return imgSrc;
	}

	public void setImgSrc(String imgSrc) {
		this.imgSrc = imgSrc;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getPlace() {
		return place;
	}

	public void setPlace(String place) {
		this.place = place;
	}

	public Checkpoint toCheckpoint() {
		CheckpointJson checkpointJson = this;
		return new Checkpoint(checkpointJson.getId(), checkpointJson.getName(),
				checkpointJson.getLabel(), checkpointJson.getDescription(), checkpointJson.getLat(),
				checkpointJson.getLon(), checkpointJson.getCourseIds(),
				checkpointJson.getMarkerColor(),
				checkpointJson.getCategory(), checkpointJson.getSubcategory(),
				checkpointJson.getVisibleTimeFrom(), checkpointJson.getVisibleTimeTo(),
				checkpointJson.getImgSrc(), checkpointJson.getPlace());
	}
}
