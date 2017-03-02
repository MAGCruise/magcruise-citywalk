package org.magcruise.citywalk.model;

import java.util.Arrays;
import java.util.Date;

import org.junit.Before;
import org.junit.Test;
import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.jsonrpc.CityWalkService;
import org.magcruise.citywalk.model.input.SelectionInput;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.relation.UserAccountsTable;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.magcruise.citywalk.model.row.Checkpoint;
import org.magcruise.citywalk.model.row.Task;
import org.magcruise.citywalk.model.row.UserAccount;
import org.magcruise.citywalk.model.row.VerifiedActivity;
import org.magcruise.citywalk.model.task.SelectionTask;
import org.nkjmlab.util.db.H2Server;
import org.nkjmlab.util.time.DateTimeUtils;

import jp.go.nict.langrid.repackaged.net.arnx.jsonic.JSON;

public class TableModelTest {
	protected static org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager
			.getLogger();

	@Before
	public void setUp() throws Exception {
		H2Server.start();
	}

	@Test
	public void test() {
		CheckpointsTable checkpoints = new CheckpointsTable(ApplicationContext.getDbClient());
		Date from = new Date(0);
		Date to = DateTimeUtils.fromTimestamp("2099-01-01 00:00:00");

		checkpoints.remakeTable();
		checkpoints.merge(new Checkpoint("aed-1", "aed-1", "A号館のAED", "desc", 38.4400, 134.11090,
				Arrays.asList("waseda"),
				"blue", "category-2", "subcategory-2-1", from, to, "", "balloon"));
		checkpoints.merge(new Checkpoint("aed-2", "aed-2", "B号館のAED", "desc", 38.4400, 134.11090,
				Arrays.asList("waseda"),
				"blue", "category-2", "subcategory-2-1", from, to, "", "balloon"));
		checkpoints.merge(new Checkpoint("cafeteria", "食堂", "みんながいく食堂", "desc", 38.4400, 134.11090,
				Arrays.asList("waseda"),
				"red", "category-1", "subcategory-1-1", from, to, "", "balloon"));
		checkpoints
				.merge(new Checkpoint("pc-room", "PCルーム", "演習で使うPCルーム", "desc", 38.4400, 134.11090,
						Arrays.asList("waseda"), "green", "category-1", "subcategory-1-2", from, to,
						"", "balloon"));
		log.debug(checkpoints.readAll());

		TasksTable tasks = new TasksTable(ApplicationContext.getDbClient());
		tasks.remakeTable();
		tasks.insert(new Task("cafeteria-selection", Arrays.asList("cafeteria"),
				new SelectionTask("次のうち、理工の学食が発祥の地であるメニューはどれ？",
						Arrays.asList("豚玉丼", "チキンおろしだれ", "カツカレー", "ポーク焼肉"),
						Arrays.asList(3), 2.0, false, 100)));
		String tid = tasks.getLastInsertId(Task.class).toString();
		tasks.insert(new Task("aed-selection",
				Arrays.asList("aed-1", "aed-2", "aed-3", "aed-4", "aed-5", "aed-6"),
				new SelectionTask("次のうち、AEDの使い方として、間違っているのはどれ？",
						Arrays.asList("パッドは右胸と左わき腹に貼る", "心電図解析中は体に触らない", "放電ボタンを押す時は、体から離れる",
								"呼吸が戻ったらパッドを速やかにはずす"),
						Arrays.asList(3), 2.0, false, 100)));
		tasks.insert(new Task("pc-room-sort", Arrays.asList("pc_room"),
				new SelectionTask("次の4つの部屋を、座席の多い順に並び替えて下さい．",
						Arrays.asList("A", "C", "E", "G"), Arrays.asList(1), 2.0, false, 100)));
		log.debug(tasks.readAll());
		VerifiedActivitiesTable activities = new VerifiedActivitiesTable(
				ApplicationContext.getDbClient());
		activities.remakeTable();
		activities.insert(
				new VerifiedActivity(new Date(), "waseda", "ayaki", "cafeteria", 38.4400, 134.11090,
						tid, 1.0, new SelectionInput("豚玉丼"), ""));

		UserAccountsTable users = new UserAccountsTable(ApplicationContext.getDbClient());
		users.remakeTable();
		users.insert(new UserAccount("ayaki", "houchimin"));
		users.insert(new UserAccount("ieiri", "waseda-u"));
		users.insert(new UserAccount("reiko", "waseda-u"));
		users.insert(new UserAccount("nkjm", "toho-u"));
		log.debug(users.readAll());

		log.debug(JSON.encode(tasks.getTasksForCourse("waseda"), true));

		CityWalkService service = new CityWalkService();
		log.debug(JSON.encode(service.getInitialData("waseda", "ja"), true));

	}

}
