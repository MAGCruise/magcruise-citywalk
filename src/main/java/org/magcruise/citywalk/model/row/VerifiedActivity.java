package org.magcruise.citywalk.model.row;

import java.util.Date;

import org.magcruise.citywalk.model.input.Input;
import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;

import net.sf.persist.annotations.Column;
import net.sf.persist.annotations.Table;

@Table(name = VerifiedActivitiesTable.TABLE_NAME)
public class VerifiedActivity extends Activity {

	public VerifiedActivity() {

	}

	public VerifiedActivity(Activity activity) {
		this(activity.getCreatedAt(), activity.getCourseId(), activity.getUserId(),
				activity.getCheckpointId(),
				activity.getLat(), activity.getLon(), activity.getTaskId(), activity.getScore(),
				activity.getInputObject(), activity.getOptions());
	}

	public VerifiedActivity(Date createdAt, String courseId, String userId, String checkpointId,
			double lat, double lon, String taskId, double score, Input input, String options) {
		super(createdAt, courseId, userId, checkpointId, lat, lon, taskId, score, input, options);
	}

	public VerifiedActivity(ActivityJson json) {
		super(json);
	}

	@Override
	@Column(autoGenerated = true)
	public long getId() {
		return super.getId();
	}

}
