package org.magcruise.citywalk.model.json.init;

import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.row.Task;

public class CheckpointJson {

	private String id;
	private String name;
	private String label;
	private double lat;
	private double lon;

	private List<TaskJson> tasks;

	public CheckpointJson() {
	}

	public CheckpointJson(String id, String name, String label, double lat, double lon,
			List<TaskJson> tasks) {
		this.id = id;
		this.name = name;
		this.label = label;
		this.lat = lat;
		this.lon = lon;
		this.tasks = tasks;
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

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

}
