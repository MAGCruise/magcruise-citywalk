package org.magcruise.citywalk.model.row;

import java.util.Date;
import java.util.Map;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.input.DescriptionInput;
import org.magcruise.citywalk.model.input.Input;
import org.magcruise.citywalk.model.input.PhotoInput;
import org.magcruise.citywalk.model.input.PinInput;
import org.magcruise.citywalk.model.input.QrCodeInput;
import org.magcruise.citywalk.model.input.SelectionInput;
import org.magcruise.citywalk.model.json.ActivityJson;
import org.nkjmlab.util.json.JsonObject;

import net.sf.persist.annotations.NoColumn;
import net.sf.persist.annotations.NoTable;

@NoTable
public class Activity {

	private long id;
	private String userId;

	private String courseId;
	private String checkpointId;
	private double lat;
	private double lon;

	private String taskId;
	private double score;
	private Input input;
	private Date createdAt;
	private String options;

	public Activity() {
	}

	public Activity(Date createdAt, String courseId, String userId, String checkpointId, double lat,
			double lon, String taskId, double score, Input input, String options) {
		this.createdAt = createdAt;
		this.courseId = courseId;
		this.userId = userId;
		this.checkpointId = checkpointId;
		this.lat = lat;
		this.lon = lon;
		this.taskId = taskId;
		this.score = score;
		this.input = input;
		this.options = options;
	}

	public Activity(ActivityJson json) {
		this(json.getCreatedAt(), json.getCourseId(), json.getUserId(), json.getCheckpointId(),
				json.getLat(), json.getLon(), json.getTaskId(), json.getScore(),
				convertToInput(json.getTaskType(), json.getInputs()), json.getOptions());
	}

	private static Input convertToInput(String taskType, Map<String, String> inputs) {
		switch (taskType) {
		case "PhotoTask":
			return new PhotoInput(inputs.get("value"));
		case "QrCodeTask":
			return new QrCodeInput(inputs.get("value"));
		case "SelectionTask":
			return new SelectionInput(inputs.get("value"));
		case "DescriptionTask":
			return new DescriptionInput(inputs.get("value"));
		case "PinTask":
			return new PinInput(inputs.get("value"));
		}
		throw new IllegalArgumentException(taskType);
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

	public String getInput() {
		return input.toJson();
	}

	public void setInput(String json) {
		this.input = JsonObject.decodeFromJson(Input.class, json);
	}

	@NoColumn
	public Input getInputObject() {
		return input;
	}

	/**
	 * InputはJSON-RPCライブラリでJson変換可能なのでOK．
	 *
	 * @param input
	 *
	 */
	public void setInputObject(Input input) {
		this.input = input;
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

	public void setCheckpointId(String checkpointId) {
		this.checkpointId = checkpointId;
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

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date created) {
		this.createdAt = created;
	}

	public String getOptions() {
		return options;
	}

	public void setOptions(String options) {
		this.options = options;
	}

}
