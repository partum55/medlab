-- MedLab Seed Data

-- 1. Test Definitions
INSERT INTO test_definition (test_name, test_code, category, normal_range, unit, description)
VALUES 
('Complete Blood Count', 'CBC', 'Hematology', '4.5-11.0', 'x10^3/uL', 'General health screening including WBC, RBC, and Platelets.'),
('Glucose, Fasting', 'GLU', 'Chemistry', '70-99', 'mg/dL', 'Measures blood sugar levels after an 8-hour fast.'),
('Lipid Panel', 'LIPID', 'Chemistry', '< 200', 'mg/dL', 'Measures cholesterol, HDL, LDL, and triglycerides.'),
('TSH (Thyroid Stimulating Hormone)', 'TSH', 'Endocrinology', '0.45-4.5', 'mIU/L', 'Screens for thyroid disorders.'),
('COVID-19 PCR', 'COVPCR', 'Molecular', 'Negative', '', 'Detection of SARS-CoV-2 viral RNA.')
ON CONFLICT (test_code) DO NOTHING;

-- 2. Medical Staff (Initial Roles)
-- Note: auth_user_id must be updated manually after the user signs in via OAuth
INSERT INTO medical_staff (first_name, last_name, role, department, phone, email)
VALUES
('Gregory', 'House', 'Ordering Physician', 'Diagnostics', '+1 555-0101', 'house@medlab.example.com'),
('Dexter', 'Morgan', 'Pathologist', 'Forensics', '+1 555-0102', 'dexter@medlab.example.com'),
('Jesse', 'Pinkman', 'Lab Technician', 'Chemistry', '+1 555-0103', 'jesse@medlab.example.com'),
('Admin', 'User', 'Admin', 'Administration', '+1 555-0000', 'admin@medlab.example.com')
ON CONFLICT (auth_user_id) DO NOTHING;
