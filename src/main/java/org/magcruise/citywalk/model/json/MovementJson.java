package org.magcruise.citywalk.model.json;

import java.util.Date;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class MovementJson {

	private String userId;
	private double lat;
	private double lon;
	private double accuracy;
	private double altitude;
	private double altitudeAccuracy;
	private double speed;
	private double heading;
	private String courseId;
	private String checkpointId;
	private Date recordedAt;

	public MovementJson() {
	}

	public MovementJson(String userId, double lat, double lon, double accuracy, double altitude,
			double altitudeAccuracy, double speed, double heading, String courseId,
			String checkpointId, Date recordedAt) {
		this.userId = userId;
		this.lat = lat;
		this.lon = lon;
		this.accuracy = accuracy;
		this.altitude = altitude;
		this.altitudeAccuracy = altitudeAccuracy;
		this.speed = speed;
		this.heading = heading;
		this.courseId = courseId;
		this.checkpointId = checkpointId;
		this.recordedAt = recordedAt;
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

	public double getAccuracy() {
		return accuracy;
	}

	public void setAccuracy(double accuracy) {
		this.accuracy = accuracy;
	}

	public double getAltitude() {
		return altitude;
	}

	public void setAltitude(double altitude) {
		this.altitude = altitude;
	}

	public double getAltitudeAccuracy() {
		return altitudeAccuracy;
	}

	public void setAltitudeAccuracy(double altitudeAccuracy) {
		this.altitudeAccuracy = altitudeAccuracy;
	}

	public double getSpeed() {
		return speed;
	}

	public void setSpeed(double speed) {
		this.speed = speed;
	}

	public double getHeading() {
		return heading;
	}

	public void setHeading(double heading) {
		this.heading = heading;
	}

	public String getCourseId() {
		return courseId;
	}

	public void setCourseId(String courseId) {
		this.courseId = courseId;
	}

	public String getCheckpointId() {
		return checkpointId;
	}

	public void setCheckpointId(String checkpointId) {
		this.checkpointId = checkpointId;
	}

	public Date getRecordedAt() {
		return recordedAt;
	}

	public void setRecordedAt(Date date) {
		this.recordedAt = date;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}
}
