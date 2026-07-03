\# Architecture Rule



This project follows a lightweight manager architecture.



The goal is maintainability, not abstraction.



Never introduce unnecessary patterns.



\---



\## Manager Rules



Every manager has exactly one responsibility.



Managers communicate only through World.



Managers never directly call each other.



Managers never manipulate another manager's internal state.



\---



Every manager must implement:



init()



destroy()



update() (optional)



\---



Managers must never create UI outside their responsibility.



Managers must never contain hardcoded character data.



Managers must load data from /data whenever possible.



\---



Current managers:



SceneManager



CharacterManager



UIManager



MemoryManager



Future managers must be approved before being added.

