import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Data migration via with-clause. Migration code is in separate file.

actor {
  include MixinStorage();

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
    level : Text;
    educationClass : ?Text;
    subjects : [Text];
  };

  public type Subject = {
    id : Nat;
    name : Text;
    level : Text;
    createdAt : Int;
  };

  public type AttendanceRecord = {
    id : Nat;
    subjectId : Nat;
    subjectName : Text;
    date : Text;
    topicCovered : Text;
    attended : Bool;
    createdAt : Int;
  };

  public type Task = {
    id : Nat;
    title : Text;
    subjectName : Text;
    dueDate : Text;
    priority : Text;
    completed : Bool;
    createdAt : Int;
  };

  public type Note = {
    id : Nat;
    subjectId : Nat;
    subjectName : Text;
    title : Text;
    content : Text;
    aiSummary : Text;
    aiKeyTopics : Text;
    aiShortNotes : Text;
    aiPyqs : Text;
    uploadedAt : Int;
  };

  public type DashboardStats = {
    todayAttendanceCount : Nat;
    pendingTasksCount : Nat;
    totalNotes : Nat;
    taskStreak : Nat;
  };

  public type UserEntry = {
    principal : Principal;
    profile : UserProfile;
  };

  public type AttendanceEntry = {
    principal : Principal;
    record : AttendanceRecord;
  };

  public type TaskEntry = {
    principal : Principal;
    task : Task;
  };

  public type NoteEntry = {
    principal : Principal;
    note : Note;
  };

  public type SubjectEntry = {
    principal : Principal;
    subject : Subject;
  };

  // Data Stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let subjects = Map.empty<Principal, Map.Map<Nat, Subject>>();
  let attendanceRecords = Map.empty<Principal, Map.Map<Nat, AttendanceRecord>>();
  let tasks = Map.empty<Principal, Map.Map<Nat, Task>>();
  let notes = Map.empty<Principal, Map.Map<Nat, Note>>();

  var subjectIdCounter = 1;
  var attendanceIdCounter = 1;
  var taskIdCounter = 1;
  var noteIdCounter = 1;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func setUserProfile(name : Text, level : Text, educationClass : ?Text, subjects : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set profiles");
    };
    let profile : UserProfile = {
      name;
      level;
      educationClass;
      subjects;
    };
    userProfiles.add(caller, profile);
  };

  // Subject Functions
  module Subject {
    public func compare(s1 : Subject, s2 : Subject) : Order.Order {
      Nat.compare(s1.id, s2.id);
    };
  };

  public shared ({ caller }) func addSubject(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add subjects");
    };
    let newId = subjectIdCounter;
    subjectIdCounter += 1;
    let subject : Subject = {
      id = newId;
      name;
      level = "Unknown"; // Placeholder, can be updated later
      createdAt = Time.now();
    };

    let userSubjects = switch (subjects.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, Subject>();
        newMap;
      };
      case (?existing) { existing };
    };

    userSubjects.add(newId, subject);
    subjects.add(caller, userSubjects);
    newId;
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access subjects");
    };
    switch (subjects.get(caller)) {
      case (null) { [] };
      case (?userSubjects) {
        userSubjects.values().toArray().sort();
      };
    };
  };

  public shared ({ caller }) func deleteSubject(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete subjects");
    };
    switch (subjects.get(caller)) {
      case (null) { Runtime.trap("No subjects found for caller") };
      case (?userSubjects) {
        userSubjects.remove(id);
      };
    };
  };

  // Attendance Functions
  // Updated function with upsert behavior
  public shared ({ caller }) func logAttendance(
    subjectId : Nat,
    subjectName : Text,
    date : Text,
    topicCovered : Text,
    attended : Bool,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log attendance");
    };
    // Fetch or initialize user's attendance records
    let userRecords = switch (attendanceRecords.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, AttendanceRecord>();
        newMap;
      };
      case (?existing) { existing };
    };

    // Check for existing record with same subjectId and date
    var existingId : ?Nat = null;
    for (entry in userRecords.entries()) {
      let (_, record) = entry;
      if (record.subjectId == subjectId and record.date == date) {
        existingId := ?record.id;
        let updatedRecord = {
          record with
          topicCovered;
          attended;
          createdAt = Time.now();
        };
        userRecords.add(record.id, updatedRecord);
      };
    };

    switch (existingId) {
      case (?id) { return id };
      case (null) {};
    };

    // If not found, create new record
    let newId = attendanceIdCounter;
    attendanceIdCounter += 1;
    let record : AttendanceRecord = {
      id = newId;
      subjectId;
      subjectName;
      date;
      topicCovered;
      attended;
      createdAt = Time.now();
    };

    userRecords.add(newId, record);
    attendanceRecords.add(caller, userRecords);
    newId;
  };

  // New function to update attendance record
  public shared ({ caller }) func updateAttendanceRecord(recordId : Nat, topicCovered : Text, attended : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update attendance");
    };
    switch (attendanceRecords.get(caller)) {
      case (null) { Runtime.trap("No attendance records found for caller") };
      case (?userRecords) {
        switch (userRecords.get(recordId)) {
          case (null) { Runtime.trap("Attendance record not found") };
          case (?existingRecord) {
            let updatedRecord = {
              existingRecord with
              topicCovered;
              attended;
              createdAt = Time.now();
            };
            userRecords.add(recordId, updatedRecord);
          };
        };
      };
    };
  };

  public query ({ caller }) func getAttendanceRecords() : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access attendance records");
    };
    switch (attendanceRecords.get(caller)) {
      case (null) { [] };
      case (?userRecords) {
        userRecords.values().toArray();
      };
    };
  };

  public query ({ caller }) func getAttendanceBySubject(subjectName : Text) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access attendance records");
    };
    switch (attendanceRecords.get(caller)) {
      case (null) { [] };
      case (?userRecords) {
        userRecords.values().toArray().filter(func(r) { r.subjectName == subjectName });
      };
    };
  };

  // Task Functions
  public shared ({ caller }) func addTask(title : Text, subjectName : Text, dueDate : Text, priority : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };
    let newId = taskIdCounter;
    taskIdCounter += 1;
    let task : Task = {
      id = newId;
      title;
      subjectName;
      dueDate;
      priority;
      completed = false;
      createdAt = Time.now();
    };

    let userTasks = switch (tasks.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, Task>();
        newMap;
      };
      case (?existing) { existing };
    };

    userTasks.add(newId, task);
    tasks.add(caller, userTasks);
    newId;
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };
    switch (tasks.get(caller)) {
      case (null) { [] };
      case (?userTasks) {
        userTasks.values().toArray();
      };
    };
  };

  public shared ({ caller }) func updateTaskStatus(taskId : Nat, completed : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    switch (tasks.get(caller)) {
      case (null) { Runtime.trap("No tasks found for caller") };
      case (?userTasks) {
        switch (userTasks.get(taskId)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) {
            let updatedTask = { task with completed };
            userTasks.add(taskId, updatedTask);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    switch (tasks.get(caller)) {
      case (null) { Runtime.trap("No tasks found for caller") };
      case (?userTasks) {
        userTasks.remove(taskId);
      };
    };
  };

  // Note Functions
  public shared ({ caller }) func addNote(subjectId : Nat, subjectName : Text, title : Text, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add notes");
    };
    let newId = noteIdCounter;
    noteIdCounter += 1;
    let note : Note = {
      id = newId;
      subjectId;
      subjectName;
      title;
      content;
      aiSummary = "";
      aiKeyTopics = "";
      aiShortNotes = "";
      aiPyqs = "";
      uploadedAt = Time.now();
    };

    let userNotes = switch (notes.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, Note>();
        newMap;
      };
      case (?existing) { existing };
    };

    userNotes.add(newId, note);
    notes.add(caller, userNotes);
    newId;
  };

  public query ({ caller }) func getNotes() : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access notes");
    };
    switch (notes.get(caller)) {
      case (null) { [] };
      case (?userNotes) {
        userNotes.values().toArray();
      };
    };
  };

  public query ({ caller }) func getNotesBySubject(subjectId : Nat) : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access notes");
    };
    switch (notes.get(caller)) {
      case (null) { [] };
      case (?userNotes) {
        userNotes.values().toArray().filter(func(n) { n.subjectId == subjectId });
      };
    };
  };

  public shared ({ caller }) func updateNoteAI(noteId : Nat, aiSummary : Text, aiKeyTopics : Text, aiShortNotes : Text, aiPyqs : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notes");
    };
    switch (notes.get(caller)) {
      case (null) { Runtime.trap("No notes found for caller") };
      case (?userNotes) {
        switch (userNotes.get(noteId)) {
          case (null) { Runtime.trap("Note not found") };
          case (?note) {
            let updatedNote = {
              note with
              aiSummary;
              aiKeyTopics;
              aiShortNotes;
              aiPyqs;
            };
            userNotes.add(noteId, updatedNote);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteNote(noteId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete notes");
    };
    switch (notes.get(caller)) {
      case (null) { Runtime.trap("No notes found for caller") };
      case (?userNotes) {
        userNotes.remove(noteId);
      };
    };
  };

  // Task Streak Function
  public query ({ caller }) func getTaskStreak() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access task streak");
    };
    switch (tasks.get(caller)) {
      case (null) { 0 };
      case (?userTasks) {
        let allTasks = userTasks.values().toArray();
        let completedTasks = allTasks.filter(func(t) { t.completed });
        
        if (completedTasks.size() == 0) {
          return 0;
        };

        // Sort by createdAt descending
        let sortedTasks = completedTasks.sort(
          func(a, b) { 
            if (a.createdAt > b.createdAt) { #less }
            else if (a.createdAt < b.createdAt) { #greater }
            else { #equal }
          }
        );

        // Calculate streak
        var streak : Nat = 0;
        var currentDay : ?Int = null;
        let oneDayNanos = 86400_000_000_000; // nanoseconds in a day

        for (task in sortedTasks.vals()) {
          let taskDay = task.createdAt / oneDayNanos;
          
          switch (currentDay) {
            case (null) {
              streak := 1;
              currentDay := ?taskDay;
            };
            case (?day) {
              if (taskDay == day) {
                // Same day, continue
              } else if (taskDay == day - 1) {
                // Consecutive day
                streak += 1;
                currentDay := ?taskDay;
              } else {
                // Streak broken
                return streak;
              };
            };
          };
        };

        streak;
      };
    };
  };

  // Dashboard Stats Function
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access dashboard stats");
    };
    let now = Time.now();
    let todayStart = (now / 86400_000_000_000) * 86400_000_000_000;
    let todayEnd = todayStart + 86400_000_000_000;

    // Count today's attendance
    var todayAttendanceCount : Nat = 0;
    switch (attendanceRecords.get(caller)) {
      case (null) {};
      case (?userRecords) {
        for (record in userRecords.values()) {
          if (record.createdAt >= todayStart and record.createdAt < todayEnd) {
            todayAttendanceCount += 1;
          };
        };
      };
    };

    // Count pending tasks
    var pendingTasksCount : Nat = 0;
    switch (tasks.get(caller)) {
      case (null) {};
      case (?userTasks) {
        for (task in userTasks.values()) {
          if (not task.completed) {
            pendingTasksCount += 1;
          };
        };
      };
    };

    // Count total notes
    var totalNotes : Nat = 0;
    switch (notes.get(caller)) {
      case (null) {};
      case (?userNotes) {
        totalNotes := userNotes.size();
      };
    };

    // Get task streak (reuse the function logic)
    var taskStreak : Nat = 0;
    switch (tasks.get(caller)) {
      case (null) {};
      case (?userTasks) {
        let allTasks = userTasks.values().toArray();
        let completedTasks = allTasks.filter(func(t) { t.completed });
        
        if (completedTasks.size() > 0) {
          let sortedTasks = completedTasks.sort(
            func(a, b) { 
              if (a.createdAt > b.createdAt) { #less }
              else if (a.createdAt < b.createdAt) { #greater }
              else { #equal }
            }
          );

          var currentDay : ?Int = null;
          let oneDayNanos = 86400_000_000_000;

          for (task in sortedTasks.vals()) {
            let taskDay = task.createdAt / oneDayNanos;
            
            switch (currentDay) {
              case (null) {
                taskStreak := 1;
                currentDay := ?taskDay;
              };
              case (?day) {
                if (taskDay == day) {
                  // Same day
                } else if (taskDay == day - 1) {
                  taskStreak += 1;
                  currentDay := ?taskDay;
                } else {
                  // Break loop
                  return {
                    todayAttendanceCount;
                    pendingTasksCount;
                    totalNotes;
                    taskStreak;
                  };
                };
              };
            };
          };
        };
      };
    };

    {
      todayAttendanceCount;
      pendingTasksCount;
      totalNotes;
      taskStreak;
    };
  };

  // Admin Bulk Data Access Functions (NO permission checks)
  public query ({ caller }) func adminGetAllUsers() : async [UserEntry] {
    let entries = userProfiles.entries().toArray();
    let userEntries = entries.map(func((principal, profile)) { { principal; profile } });
    userEntries;
  };

  public query ({ caller }) func adminGetAllAttendance() : async [AttendanceEntry] {
    var allEntries : [AttendanceEntry] = [];

    for ((principal, records) in attendanceRecords.entries()) {
      let recordEntries = records.entries().toArray().map(
        func((_, record)) { { principal; record } }
      );
      allEntries := allEntries.concat(recordEntries);
    };
    allEntries;
  };

  public query ({ caller }) func adminGetAllTasks() : async [TaskEntry] {
    var allEntries : [TaskEntry] = [];

    for ((principal, userTasks) in tasks.entries()) {
      let taskEntries = userTasks.entries().toArray().map(
        func((_, task)) { { principal; task } }
      );
      allEntries := allEntries.concat(taskEntries);
    };
    allEntries;
  };

  public query ({ caller }) func adminGetAllNotes() : async [NoteEntry] {
    var allEntries : [NoteEntry] = [];

    for ((principal, userNotes) in notes.entries()) {
      let noteEntries = userNotes.entries().toArray().map(
        func((_, note)) { { principal; note } }
      );
      allEntries := allEntries.concat(noteEntries);
    };
    allEntries;
  };

  public query ({ caller }) func adminGetAllSubjects() : async [SubjectEntry] {
    var allEntries : [SubjectEntry] = [];

    for ((principal, userSubjects) in subjects.entries()) {
      let subjectEntries = userSubjects.entries().toArray().map(
        func((_, subject)) { { principal; subject } }
      );
      allEntries := allEntries.concat(subjectEntries);
    };
    allEntries;
  };

  // Admin Update/Delete Functions (NO permission checks)
  public shared ({ caller }) func adminDeleteAttendance(user : Principal, recordId : Nat) : async () {
    switch (attendanceRecords.get(user)) {
      case (null) { Runtime.trap("No attendance records found for user") };
      case (?userRecords) {
        userRecords.remove(recordId);
      };
    };
  };

  public shared ({ caller }) func adminUpdateAttendance(user : Principal, recordId : Nat, topicCovered : Text, attended : Bool) : async () {
    switch (attendanceRecords.get(user)) {
      case (null) { Runtime.trap("No attendance records found for user") };
      case (?userRecords) {
        switch (userRecords.get(recordId)) {
          case (null) { Runtime.trap("Attendance record not found") };
          case (?existingRecord) {
            let updatedRecord = {
              existingRecord with
              topicCovered;
              attended;
              createdAt = Time.now();
            };
            userRecords.add(recordId, updatedRecord);
          };
        };
      };
    };
  };

  public shared ({ caller }) func adminDeleteTask(user : Principal, taskId : Nat) : async () {
    switch (tasks.get(user)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?userTasks) {
        userTasks.remove(taskId);
      };
    };
  };

  public shared ({ caller }) func adminUpdateTask(
    user : Principal,
    taskId : Nat,
    title : Text,
    dueDate : Text,
    priority : Text,
    completed : Bool,
  ) : async () {
    switch (tasks.get(user)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?userTasks) {
        switch (userTasks.get(taskId)) {
          case (null) { Runtime.trap("Task not found") };
          case (?existingTask) {
            let updatedTask = {
              existingTask with
              title;
              dueDate;
              priority;
              completed;
              createdAt = Time.now(); // Updated timestamp
            };
            userTasks.add(taskId, updatedTask);
          };
        };
      };
    };
  };

  public shared ({ caller }) func adminDeleteNote(user : Principal, noteId : Nat) : async () {
    switch (notes.get(user)) {
      case (null) { Runtime.trap("No notes found for user") };
      case (?userNotes) {
        userNotes.remove(noteId);
      };
    };
  };

  public shared ({ caller }) func adminUpdateNote(
    user : Principal,
    noteId : Nat,
    title : Text,
    content : Text,
    aiSummary : Text,
  ) : async () {
    switch (notes.get(user)) {
      case (null) { Runtime.trap("No notes found for user") };
      case (?userNotes) {
        switch (userNotes.get(noteId)) {
          case (null) { Runtime.trap("Note not found") };
          case (?existingNote) {
            let updatedNote = {
              existingNote with
              title;
              content;
              aiSummary;
              uploadedAt = Time.now();
            };
            userNotes.add(noteId, updatedNote);
          };
        };
      };
    };
  };

  public shared ({ caller }) func adminDeleteSubject(user : Principal, subjectId : Nat) : async () {
    switch (subjects.get(user)) {
      case (null) { Runtime.trap("No subjects found for user") };
      case (?userSubjects) {
        userSubjects.remove(subjectId);
      };
    };
  };
};
