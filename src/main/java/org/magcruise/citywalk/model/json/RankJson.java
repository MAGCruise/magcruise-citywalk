package org.magcruise.citywalk.model.json;

public class RankJson {

	private String name;
	private int rank;
	private double score;

	public RankJson() {

	}

	public RankJson(String name, int rank, double score) {
		this.name = name;
		this.rank = rank;
		this.score = score;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getRank() {
		return rank;
	}

	public void setRank(int rank) {
		this.rank = rank;
	}

	public double getScore() {
		return score;
	}

	public void setScore(double score) {
		this.score = score;
	}

}
