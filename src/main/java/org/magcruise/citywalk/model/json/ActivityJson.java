package org.magcruise.citywalk.model.json;

import java.sql.Timestamp;
import java.util.Date;
import java.util.Map;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.row.Activity;

public class ActivityJson {

	private long id;
	private String userId;

	private String courseId;
	private String checkpointId;
	private double lat;
	private double lon;

	private String taskId;
	private String taskType = "";

	private double score;

	/** key-value. valueはjson化された文字列を想定． **/
	private Map<String, String> inputs;

	private Date saved = new Timestamp(new Date().getTime());

	public ActivityJson() {
	}

	public ActivityJson(Activity activity) {
		this.id = activity.getId();
		this.courseId = activity.getCourseId();
		this.userId = activity.getUserId();
		this.checkpointId = activity.getCheckpointId();
		this.lat = activity.getLat();
		this.lon = activity.getLon();
		this.taskId = activity.getTaskId();

	}

	public Date getSaved() {
		return saved;
	}

	public void setSaved(Date saved) {
		this.saved = saved;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getTaskId() {
		return taskId;
	}

	public void setTaskId(String taskId) {
		this.taskId = taskId;
	}

	public double getScore() {
		return score;
	}

	public void setScore(double score) {
		this.score = score;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
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

	public Map<String, String> getInputs() {
		return inputs;
	}

	public void setInputs(Map<String, String> inputs) {
		this.inputs = inputs;
	}

	public String getTaskType() {
		return taskType;
	}

	public void setTaskType(String taskType) {
		this.taskType = taskType;
	}

	public String getCheckpointId() {
		return checkpointId;
	}

	public void setCheckpointId(String checkPointId) {
		this.checkpointId = checkPointId;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public String getCourseId() {
		return courseId;
	}

	public void setCourseId(String courseId) {
		this.courseId = courseId;
	}

}
