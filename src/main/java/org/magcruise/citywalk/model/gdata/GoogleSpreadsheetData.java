package org.magcruise.citywalk.model.gdata;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class GoogleSpreadsheetData {
	private int rownum;
	private String checkpointid;
	private String category;
	private String subcategory;
	private String name;
	private double lat;
	private double lon;
	private String emphasistimefrom;
	private String emphasistimeto;
	private String invisibletimefrom;
	private String invisibletimeto;
	private double point;
	private double pointwhenemphasistime;
	private String label;
	private String description;
	private String imgsrc;
	private String answerqr;
	private String markercolor;
	private String place;

	public int getRownum() {
		return rownum;
	}

	public void setRownum(int rowNum) {
		this.rownum = rowNum;
	}

	public String getCheckpointid() {
		return checkpointid;
	}

	public void setCheckpointid(String checkpointId) {
		this.checkpointid = checkpointId;
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

	public void setSubcategory(String subCategory) {
		this.subcategory = subCategory;
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

	public String getEmphasistimefrom() {
		return emphasistimefrom;
	}

	public void setEmphasistimefrom(String emphasisTimeFrom) {
		this.emphasistimefrom = emphasisTimeFrom;
	}

	public String getEmphasistimeto() {
		return emphasistimeto;
	}

	public void setEmphasistimeto(String emphasisTimeTo) {
		this.emphasistimeto = emphasisTimeTo;
	}

	public String getInvisibletimefrom() {
		return invisibletimefrom;
	}

	public void setInvisibletimefrom(String invisibleTimeFrom) {
		this.invisibletimefrom = invisibleTimeFrom;
	}

	public String getInvisibletimeto() {
		return invisibletimeto;
	}

	public void setInvisibletimeto(String invisibleTimeTo) {
		this.invisibletimeto = invisibleTimeTo;
	}

	public double getPoint() {
		return point;
	}

	public void setPoint(double point) {
		this.point = point;
	}

	public double getPointwhenemphasistime() {
		return pointwhenemphasistime;
	}

	public void setPointwhenemphasistime(double pointWhenEmphasisTime) {
		this.pointwhenemphasistime = pointWhenEmphasisTime;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getImgsrc() {
		return imgsrc;
	}

	public void setImgsrc(String imgsrc) {
		this.imgsrc = imgsrc;
	}

	public String getAnswerqr() {
		return answerqr;
	}

	public void setAnswerqr(String answerqr) {
		this.answerqr = answerqr;
	}

	public String getMarkerColor() {
		return markercolor;
	}

	public void setMarkerColor(String markercolor) {
		this.markercolor = markercolor;
	}
	
	public String getPlace() {
		return place;
	}

	public void setPlace(String balloon) {
		this.place = balloon;
	}
}
