package org.magcruise.citywalk.model.row;

import java.util.Date;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.relation.MovementsTable;

import net.sf.persist.annotations.Column;
import net.sf.persist.annotations.Table;

@Table(name = MovementsTable.TABLE_NAME)
public class Movement {

	private long id;
	private String userId;
	private String checkpointGroupId;
	private String checkpointId;
	private double lat;
	private double lon;
	private double accuracy;
	private double altitude;
	private double altitudeAccuracy;
	private double speed;
	private Date created;
	private double heading;

	public Movement() {
	}

	public Movement(MovementJson json) {
		this.checkpointGroupId = json.getCheckpointGroupId();
		this.userId = json.getUserId();
		this.checkpointId = json.getCheckpointId();
		this.lat = json.getLat();
		this.lon = json.getLon();
		this.accuracy = json.getAccuracy();
		this.altitude = json.getAltitude();
		this.altitudeAccuracy = json.getAltitudeAccuracy();
		this.speed = json.getSpeed();
		this.created = json.getDate();
		this.heading = json.getHeading();
	}

	@Column(autoGenerated = true)
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getCheckpointId() {
		return checkpointId;
	}

	public double getLat() {
		return lat;
	}

	public double getLon() {
		return lon;
	}

	public void setLat(double lat) {
		this.lat = lat;
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

	public void setCheckpointId(String checkpointId) {
		this.checkpointId = checkpointId;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public String getCheckpointGroupId() {
		return checkpointGroupId;
	}

	public void setCheckpointGroupId(String checkpointGroupId) {
		this.checkpointGroupId = checkpointGroupId;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public double getHeading() {
		return heading;
	}

	public void setHeading(double heading) {
		this.heading = heading;
	}

}
