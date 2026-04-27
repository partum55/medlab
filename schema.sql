-- MedLab schema — paste into Supabase SQL Editor and run

create table patient (
  patient_id       serial primary key,
  auth_user_id     uuid references auth.users(id) on delete set null unique,
  profile_complete boolean not null default false,
  first_name       text,
  last_name        text,
  date_of_birth    date,
  gender           text,
  phone            text,
  email            text,
  address          text
);

create table medical_staff (
  staff_id     serial primary key,
  auth_user_id uuid references auth.users(id) on delete set null unique,
  first_name   text not null,
  last_name    text not null,
  role         text not null check (role in ('Ordering Physician', 'Lab Technician', 'Pathologist', 'Admin')),
  department   text,
  phone        text,
  email        text
);

create table test_definition (
  test_def_id  serial primary key,
  test_name    text not null,
  test_code    text not null unique,
  category     text,
  normal_range text,
  unit         text,
  description  text
);

create table test_order (
  order_id            serial primary key,
  patient_id          int not null references patient(patient_id),
  staff_id            int not null references medical_staff(staff_id),
  test_def_id         int not null references test_definition(test_def_id),
  order_date          date not null default current_date,
  priority            text not null check (priority in ('ROUTINE', 'URGENT', 'STAT')),
  status              text not null default 'ORDERED' check (status in ('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  notes               text,
  cancellation_reason text
);

create table specimen (
  specimen_id      serial primary key,
  order_id         int not null references test_order(order_id),
  specimen_type    text not null,
  collection_date  date,
  collected_by     int references medical_staff(staff_id),
  storage_temp     numeric(5,2),
  barcode          text,
  rejection_reason text,
  status           text not null default 'COLLECTED' check (status in ('PENDING', 'COLLECTED', 'IN_ANALYSIS', 'COMPLETED', 'REJECTED'))
);

create table lab_report (
  report_id      serial primary key,
  specimen_id    int not null references specimen(specimen_id),
  reviewed_by    int references medical_staff(staff_id),
  report_date    date,
  overall_status text check (overall_status in ('NORMAL', 'ABNORMAL', 'CRITICAL', 'PENDING')),
  comments       text,
  is_amended     boolean not null default false,
  amendment_note text
);

create table result_item (
  report_id     int not null references lab_report(report_id),
  item_seq_no   int not null,
  test_def_id   int not null references test_definition(test_def_id),
  measured_value text,
  text_result   text,
  flag          text check (flag in ('H', 'HH', 'L', 'LL', 'A', 'C')),
  primary key (report_id, item_seq_no)
);
