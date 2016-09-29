package org.magcruise.citywalk.jsonrpc;

public class VisitedCheckpointJson {

	private String checkpointId;
	private double score = 0.0;
	private double point = 0.0;

	public VisitedCheckpointJson() {
	}

	public VisitedCheckpointJson(String checkpointId) {
		this.checkpointId = checkpointId;
	}

	public void addScore(double score) {
		this.score += score;
	}

	public void addPoint(double point) {
		this.point += point;
	}

	public String getCheckpointId() {
		return checkpointId;
	}

	public void setCheckpointId(String checkpointId) {
		this.checkpointId = checkpointId;
	}

	public double getScore() {
		return score;
	}

	public void setScore(double score) {
		this.score = score;
	}

	public double getPoint() {
		return point;
	}

	public void setPoint(double point) {
		this.point = point;
	}

}
