/*==============================================================*/
/* DBMS name:      ORACLE Version 12c                           */
/* Created on:     4/17/2024 6:26:33 PM                         */
/*==============================================================*/


alter table CANDIDATO
   drop constraint FK_CANDIDAT_TIPODOC_C_TIPODOC;

drop index TIPODOC_CANDIDATO_FK;

drop table CANDIDATO cascade constraints;

drop table TIPODOC cascade constraints;

/*==============================================================*/
/* Table: CANDIDATO                                             */
/*==============================================================*/
create table CANDIDATO (
   USUARIO              VARCHAR2(30)          not null,
   IDTIPODOC_CANDIDATO  VARCHAR2(3)           not null,
   NOMBRE               VARCHAR2(30),
   APELLIDO             VARCHAR2(30),
   FECHANAC             DATE,
   NDOC                 NUMBER(15),
   constraint PK_CANDIDATO primary key (USUARIO)
);

/*==============================================================*/
/* Index: TIPODOC_CANDIDATO_FK                                  */
/*==============================================================*/
create index TIPODOC_CANDIDATO_FK on CANDIDATO (
   IDTIPODOC_CANDIDATO ASC
);

/*==============================================================*/
/* Table: TIPODOC                                               */
/*==============================================================*/
create table TIPODOC (
   IDTIPODOC            VARCHAR2(3)           not null,
   DESCTIPODOC          VARCHAR2(30),
   constraint PK_TIPODOC primary key (IDTIPODOC)
);

alter table CANDIDATO
   add constraint FK_CANDIDAT_TIPODOC_C_TIPODOC foreign key (IDTIPODOC_CANDIDATO)
      references TIPODOC (IDTIPODOC);

