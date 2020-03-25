-- MySQL Workbench Forward Engineering
SET
    @OLD_UNIQUE_CHECKS = @ @UNIQUE_CHECKS,
    UNIQUE_CHECKS = 0;

SET
    @OLD_FOREIGN_KEY_CHECKS = @ @FOREIGN_KEY_CHECKS,
    FOREIGN_KEY_CHECKS = 0;

SET
    @OLD_SQL_MODE = @ @SQL_MODE,
    SQL_MODE = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema batn-db
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema batn-db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `batn-db` DEFAULT CHARACTER SET utf8;

USE `batn-db`;

-- -----------------------------------------------------
-- Table `batn-db`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `batn-db`.`users` (
    `user_id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `photo` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `password_changed_at` TIMESTAMP NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `password_reset_expires` VARCHAR(255) NULL,
    `active` TINYINT NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `batn-db`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `batn-db`.`category` (
    `category_id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`category_id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `batn-db`.`profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `batn-db`.`profiles` (
    `profile_id` INT NOT NULL AUTO_INCREMENT,
    `category_id` INT NOT NULL,
    `title` VARCHAR(50) NOT NULL,
    `description` MEDIUMTEXT NULL,
    `owner` VARCHAR(50) NULL,
    `phone` VARCHAR(50) NULL,
    `place` VARCHAR(50) NULL,
    `social` MEDIUMTEXT NULL,
    PRIMARY KEY (`profile_id`),
    INDEX `fk_profiles_category_idx` (`category_id` ASC) VISIBLE,
    CONSTRAINT `fk_profiles_category` FOREIGN KEY (`category_id`) REFERENCES `batn-db`.`category` (`category_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `batn-db`.`photos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `batn-db`.`photos` (
    `photo_id` INT NOT NULL AUTO_INCREMENT,
    `profile_id` INT NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`photo_id`),
    INDEX `fk_photos_profiles1_idx` (`profile_id` ASC) VISIBLE,
    CONSTRAINT `fk_photos_profiles1` FOREIGN KEY (`profile_id`) REFERENCES `batn-db`.`profiles` (`profile_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB;

SET
    SQL_MODE = @OLD_SQL_MODE;

SET
    FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SET
    UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;