-- PostgreSQL schema proposal for the uploaded Excel annual report template

CREATE TABLE annual_reports (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    report_year INTEGER NOT NULL,
    organization_name TEXT,
    notes TEXT
);

CREATE TABLE sectors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100),
    notes TEXT
);

CREATE TABLE donors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_info TEXT,
    notes TEXT
);

CREATE TABLE governorates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE districts (
    id BIGSERIAL PRIMARY KEY,
    governorate_id BIGINT NOT NULL REFERENCES governorates(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    UNIQUE (governorate_id, name)
);

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    annual_report_id BIGINT REFERENCES annual_reports(id) ON DELETE SET NULL,
    sector_id BIGINT REFERENCES sectors(id) ON DELETE SET NULL,
    donor_id BIGINT REFERENCES donors(id) ON DELETE SET NULL,
    sheet_no INTEGER,
    project_name TEXT NOT NULL,
    project_brief TEXT,
    project_outputs TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('منتهي', 'مستمر')),
    budget_usd NUMERIC(18,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_locations (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    governorate_id BIGINT NOT NULL REFERENCES governorates(id) ON DELETE RESTRICT,
    district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL,
    families_count INTEGER DEFAULT 0 CHECK (families_count >= 0),
    boys_count INTEGER DEFAULT 0 CHECK (boys_count >= 0),
    girls_count INTEGER DEFAULT 0 CHECK (girls_count >= 0),
    men_count INTEGER DEFAULT 0 CHECK (men_count >= 0),
    women_count INTEGER DEFAULT 0 CHECK (women_count >= 0),
    UNIQUE (project_id, governorate_id, district_id)
);

-- View for derived beneficiary metrics
CREATE OR REPLACE VIEW vw_project_location_stats AS
SELECT
    pl.id,
    pl.project_id,
    pl.governorate_id,
    pl.district_id,
    pl.families_count,
    pl.boys_count,
    pl.girls_count,
    pl.men_count,
    pl.women_count,
    (pl.boys_count + pl.girls_count + pl.men_count + pl.women_count) AS total_beneficiaries,
    (pl.boys_count + pl.men_count) AS total_males_with_boys,
    (pl.girls_count + pl.women_count) AS total_females_with_girls
FROM project_locations pl;

-- Summary by governorate (similar to Excel "الإجماليات")
CREATE OR REPLACE VIEW vw_governorate_annual_summary AS
SELECT
    ar.id AS annual_report_id,
    ar.report_year,
    g.id AS governorate_id,
    g.name AS governorate_name,
    SUM(pl.families_count) AS total_families,
    SUM(pl.boys_count) AS total_boys,
    SUM(pl.girls_count) AS total_girls,
    SUM(pl.men_count) AS total_men,
    SUM(pl.women_count) AS total_women,
    SUM(pl.boys_count + pl.girls_count + pl.men_count + pl.women_count) AS total_beneficiaries,
    SUM(pl.boys_count + pl.men_count) AS total_males_with_boys,
    SUM(pl.girls_count + pl.women_count) AS total_females_with_girls
FROM annual_reports ar
JOIN projects p ON p.annual_report_id = ar.id
JOIN project_locations pl ON pl.project_id = p.id
JOIN governorates g ON g.id = pl.governorate_id
GROUP BY ar.id, ar.report_year, g.id, g.name;
