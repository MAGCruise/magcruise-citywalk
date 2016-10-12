package org.magcruise.citywalk.model.json;

import java.util.Date;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class MovementJson {

	private String userId;
	private double lat;
	private double lon;
	private double heading;
	private String checkpointGroupId;
	private String checkpointId;
	private Date date;

	public MovementJson() {
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
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

	public double getHeading() {
		return heading;
	}

	public void setHeading(double heading) {
		this.heading = heading;
	}

	public String getCheckpointGroupId() {
		return checkpointGroupId;
	}

	public void setCheckpointGroupId(String checkpointGroupId) {
		this.checkpointGroupId = checkpointGroupId;
	}

	public String getCheckpointId() {
		return checkpointId;
	}

	public void setCheckpointId(String checkpointId) {
		this.checkpointId = checkpointId;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}
}
