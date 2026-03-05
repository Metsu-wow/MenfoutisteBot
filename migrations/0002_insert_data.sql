-- Migration number: 0002 	 2026-03-04

-- Insert Professions
INSERT INTO professions (name) VALUES
('Alchimie'),
('Calligraphie'),
('Couture'),
('Enchantement'),
('Forge'),
('Ingénierie'),
('Joaillerie'),
('Travail du cuir'),
('Dépeçage'),
('Herboristerie'),
('Minage'),
('Cuisine'),
('Pêche');

-- Insert Specializations for 'Alchimie'
INSERT INTO specializations (profession_id, name) VALUES
(1, 'Prodige des potions'),
(1, 'Maîtrise des flacons'),
(1, 'Expertise en transmutation');

-- Insert Specializations for 'Calligraphie'
INSERT INTO specializations (profession_id, name) VALUES
(2, 'Plans'),
(2, 'Produits perfectionnés'),
(2, 'Singularités de Sombrelune');

-- Insert Specializations for 'Couture'
INSERT INTO specializations (profession_id, name) VALUES
(3, 'Atours sin’dorei'),
(3, 'Couture preste'),
(3, 'Spécialiste de la trame');

-- Insert Specializations for 'Enchantement'
INSERT INTO specializations (profession_id, name) VALUES
(4, 'Délégation désenchantée'),
(4, 'Amélioration de l’équipement'),
(4, 'Éphémères, toniques et outils');

-- Insert Specializations for 'Forge'
INSERT INTO specializations (profession_id, name) VALUES
(5, 'Armures'),
(5, 'Armes'),
(5, 'Métiers'),
(5, 'Traditions');

-- Insert Specializations for 'Ingénierie'
INSERT INTO specializations (profession_id, name) VALUES
(6, 'Analyse des combats'),
(6, 'Mobilité de marché'),
(6, 'Pièces et robots');