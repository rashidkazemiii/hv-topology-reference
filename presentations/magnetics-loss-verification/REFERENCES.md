# References — Experimental Verification of Automated Loss Simulation of Magnetic Components

Companion to `Automated_Magnetics_Loss_Verification.pptx`. Numbering matches slide 6.

**Core idea of the poster.** An automated, Python-based workflow predicts the losses of magnetic components: PLECS for the circuit, the Infineon SPICE solver for the switches, and 2D FEM in Ansys Maxwell for inductors and transformers. All of those losses end up as heat. The predictions are therefore checked thermally, with a near-adiabatic liquid calorimeter that computes the loss as P_loss = C_Th · dT/dt.

---

## The poster and the reference it cites

1. **P. Skoff, M. Stoiber, J. Reynvaan, W. Konrad** (Silicon Austria Labs, with Infineon Technologies AG), "Experimental verification of automated loss-simulation of magnetic components," poster, *Power Electronics for Energy Transition Symposium*, Vienna, Austria, Sep. 29–30, 2026.
   [SAL research portal](https://silicon-austria-labs.elsevierpure.com/en/organisations/coexistence-electromagnetic-compatibility-cemc/) · [event (IEEE Austria)](https://www.ieee-austria.org/event-details.php?id=322)
2. **J. Reynvaan, M. Pajnić, J. Krenn**, "Evaluating fluid based transient calorimetric method for measurement of the ferrite core losses," in *Proc. 11th Int. Conf. Power Electronics – ECCE Asia (ICPE 2023-ECCE Asia)*, Jeju, Korea, 2023, pp. 3308–3313. DOI: [10.23919/ICPE2023-ECCEAsia54778.2023.10213808](https://doi.org/10.23919/ICPE2023-ECCEAsia54778.2023.10213808)
   **This is the reference printed on the poster.** It is the same group's evaluation of the stirred, fluid-based transient calorimeter that the poster uses to measure inductor losses.

## Thermal (calorimetric) loss measurement — similar concept

3. **P. Papamanolis, T. Guillod, F. Krismer, J. W. Kolar**, "Transient calorimetric measurement of ferrite core losses up to 50 MHz," *IEEE Trans. Power Electron.*, vol. 36, no. 3, pp. 2548–2563, 2021. [IEEE Xplore](https://ieeexplore.ieee.org/document/9169835/) · [accepted version (PDF)](https://www.ams-publications.ee.ethz.ch/uploads/tx_ethpublications/12_Transient_Calorimetric_Papamanolis-TPEL_ACCEPTED-VERSION.pdf)
   Uses the same principle (loss = heat capacity × temperature slope) on ferrite cores, with accuracy that does not depend on waveform or frequency.
4. **D. Christen, U. Badstuebner, J. Biela, J. W. Kolar**, "Calorimetric power loss measurement for highly efficient converters," in *Proc. IPEC 2010 (ECCE Asia)*, Sapporo, 2010, pp. 1438–1445. DOI: [10.1109/IPEC.2010.5544503](https://doi.org/10.1109/IPEC.2010.5544503)
   A double-jacketed steady-state calorimeter that needs a coolant-flow measurement. The poster's near-adiabatic set-up avoids exactly that.
5. **S. Weier, M. A. Shafi, R. McMahon**, "Precision calorimetry for the accurate measurement of losses in power electronic devices," *IEEE Trans. Ind. Appl.*, vol. 46, no. 1, pp. 278–284, 2010. [ResearchGate](https://www.researchgate.net/publication/224083614_Precision_Calorimetry_for_the_Accurate_Measurement_of_Losses_in_Power_Electronic_Devices)
6. **C. Xiao, G. Chen, W. G. H. Odendaal**, "Overview of power loss measurement techniques in power electronics systems," *IEEE Trans. Ind. Appl.*, vol. 43, no. 3, pp. 657–664, 2007. [ResearchGate](https://www.researchgate.net/publication/3173215_Overview_of_Power_Loss_Measurement_Techniques_in_Power_Electronics_Systems)
7. **Z. Yi, Z. Liu, K. Sun, B. Su**, "A simple power loss evaluation method for high-frequency transformers based on surface temperature measurement within wide operation range," *IEEE J. Emerg. Sel. Topics Power Electron.*, vol. 12, no. 6, pp. 5437–5451, 2024. [IEEE Xplore](https://ieeexplore.ieee.org/document/10542955)
   Another thermal route to the losses of magnetic components, here based on surface temperature.
8. **L. Zhu, Z. Liu, Y. Dang, S. Zhang, G. Zhang, S. Ji**, "A review of power loss measurement method for high-frequency transformer," *Renewable Energy System and Equipment*, 2026. DOI: [10.1016/j.rese.2026.05.002](https://doi.org/10.1016/j.rese.2026.05.002)

## Magnetic loss and thermal modelling / simulation — similar concept

9. **P. L. Dowell**, "Effects of eddy currents in transformer windings," *Proc. IEE*, vol. 113, no. 8, pp. 1387–1394, 1966. DOI: [10.1049/piee.1966.0236](https://doi.org/10.1049/piee.1966.0236)
10. **R. P. Wojda, M. K. Kazimierczuk**, "Winding resistance and power loss of inductors with litz and solid-round wires," *IEEE Trans. Ind. Appl.*, vol. 54, no. 4, pp. 3548–3557, 2018. DOI: [10.1109/TIA.2018.2821647](https://doi.org/10.1109/TIA.2018.2821647)
    Compares solid and litz windings directly, which matters for the poster's open question.
11. **J. Mühlethaler, J. Biela, J. W. Kolar, A. Ecklebe**, "Improved core-loss calculation for magnetic components employed in power electronic systems," *IEEE Trans. Power Electron.*, vol. 27, no. 2, pp. 964–973, 2012. DOI: [10.1109/TPEL.2011.2162252](https://doi.org/10.1109/TPEL.2011.2162252)
12. **P. A. Kyaw, M. Delhommais, J. Qiu, C. R. Sullivan, J.-L. Schanen, C. Rigaud**, "Thermal modeling of inductor and transformer windings including litz wire," *IEEE Trans. Power Electron.*, vol. 35, no. 1, pp. 867–881, 2020. [IEEE Xplore](https://ieeexplore.ieee.org/document/8704907/)
13. **N. Förster et al.**, "An open-source FEM magnetic toolbox for calculating electric and thermal behavior of power electronic magnetic components," in *Proc. EPE'22 ECCE Europe*, Hanover, 2022. [IEEE Xplore](https://ieeexplore.ieee.org/document/9907554/) · [code (FEMMT, Python)](https://github.com/upb-lea/FEM_Magnetics_Toolbox)
    A Python FEM workflow for magnetics that includes a thermal simulation, close in spirit to the poster.
14. **N. Djekanovic, M. Luo, D. Dujic**, "Integrated simulation approach to loss calculations of power converter systems," in *Proc. PCIM Europe digital days*, 2020, pp. 418–425. [IEEE Xplore](https://ieeexplore.ieee.org/document/9178031/)
15. **T. Guillod, P. Papamanolis, J. W. Kolar**, "Artificial neural network (ANN) based fast and accurate inductor modeling and design," *IEEE Open J. Power Electron.*, vol. 1, pp. 284–299, 2020. [PDF](https://www.ams-publications.ee.ethz.ch/uploads/tx_ethpublications/13_paper_ANN_guillod_ACCEPTED-VERSION.pdf)
    FEM-based magnetic and thermal inductor models, applied to a buck-converter inductor.
