package org.magcruise.citywalk.model.row;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.relation.CheckpointsTable;

import jp.go.nict.langrid.repackaged.net.arnx.jsonic.JSON;
import net.sf.persist.annotations.Column;
import net.sf.persist.annotations.Table;

@Table(name = CheckpointsTable.TABLE_NAME)
public class Checkpoint {

	private String id;
	private Date created = new Timestamp(new Date().getTime());
	private String name;
	private String label;
	private String description;
	private double lat;
	private double lon;
	private List<String> checkpointGroupIds = new ArrayList<>();
	private String markerColor;
	private String category;
	private String subcategory;
	private Date visibleTimeFrom;
	private Date visibleTimeTo;
	private String imgSrc;
	private String balloon;

	public Checkpoint() {
	}

	public Checkpoint(String id, String name, String label, String description, double lat,
			double lon, List<String> checkPointGroupIds, String markerColor, String category,
			String subcategory, Date visibleTimeFrom,
			Date visibleTimeTo, String imgSrc, String balloon) {
		this.id = id;
		this.name = name;
		this.label = label;
		this.description = description;
		this.lat = lat;
		this.lon = lon;
		this.checkpointGroupIds.addAll(checkPointGroupIds);
		this.markerColor = markerColor;
		this.category = category;
		this.subcategory = subcategory;
		this.visibleTimeFrom = visibleTimeFrom;
		this.visibleTimeTo = visibleTimeTo;
		this.imgSrc = imgSrc;
		this.balloon = balloon;
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

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	@Column(name = CheckpointsTable.CHECKPOINT_GROUP_IDS)
	public String getCheckpointGroupIdsString() {
		return JSON.encode(checkpointGroupIds);
	}

	public void setCheckpointGroupIdsString(String checkpointGroupIds) {
		@SuppressWarnings("unchecked")
		List<String> r = JSON.decode(checkpointGroupIds, List.class);
		this.checkpointGroupIds.addAll(r);
	}

	public List<String> getCheckpointGroupIds() {
		return checkpointGroupIds;
	}

	public void setCheckpointGroupIds(List<String> checkpointGroupIds) {
		this.checkpointGroupIds = checkpointGroupIds;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
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

	public String getBalloon() {
		return balloon;
	}

	public void setBalloon(String balloon) {
		this.balloon = balloon;
	}
}
