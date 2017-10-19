package org.magcruise.citywalk.model.json.init;

import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.nkjmlab.util.time.DateTimeUtils;

public class CheckpointJson {

	private String id;
	private String name;
	private String label;
	private String description;
	private double lat;
	private double lon;

	private CheckinJson checkin;
	private List<TaskJson> tasks;
	private String markerColor;
	private String category;
	private String subcategory;
	private String imgSrc;
	private Date visibleTimeFrom = new Date(0);
	private Date visibleTimeTo = DateTimeUtils.fromTimestamp("2099-01-01 00:00:00");
	private String place;

	public CheckpointJson() {
	}

	public CheckpointJson(String id, String name, String label, String description, double lat,
			double lon, CheckinJson checkin, List<TaskJson> tasks, String markerColor,
			String category, String subcategory, Date visibleTimeFrom, Date visibleTimeTo,
			String imgSrc, String place) {
		this.id = id;
		this.name = name;
		this.label = label;
		this.description = description;
		this.lat = lat;
		this.lon = lon;
		this.checkin = checkin;
		this.tasks = tasks;
		this.markerColor = markerColor;
		this.category = category;
		this.subcategory = subcategory;
		this.visibleTimeFrom = visibleTimeFrom;
		this.visibleTimeTo = visibleTimeTo;
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

	public List<TaskJson> getTasks() {
		return tasks;
	}

	public void setTask(List<TaskJson> tasks) {
		this.tasks = tasks;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public CheckinJson getCheckin() {
		return checkin;
	}

	public void setCheckin(CheckinJson checkin) {
		this.checkin = checkin;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
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

	public void setTasks(List<TaskJson> tasks) {
		this.tasks = tasks;
	}

	public String getPlace() {
		return place;
	}

	public void setPlace(String place) {
		this.place = place;
	}
}
