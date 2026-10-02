# References — Experimental Verification of Automated Loss Simulation for Magnetic Components

Companion to `Automated_Magnetics_Loss_Verification.pptx` (numbering matches slide 6).

**About the poster.** The poster has no reference list of its own. Reference [1] is the poster's own record, [2] is the authors' paper on the calorimetric method the set-up builds on, and [3]–[20] cover the published work behind each part of the poster.

**Date note.** The footer in the supplied poster image appears to read "28 Sept. 2023", but the text in that image is visibly distorted. SAL's research portal lists the poster as presented on **29–30 Sep 2026** at the *Power Electronics for Energy Transition Symposium* (AIT & SAL, DoubleTree by Hilton Vienna Schönbrunn, Vienna). Per the organisers' event listings, the symposium was first held in 2025 (Graz).

Bibliographic details were checked against publisher, indexing and institutional pages. A DOI appears only where it could be confirmed; otherwise a stable link is given.

---

## A. The poster and the authors' related work

1. **P. Skoff, M. Stoiber, J. Reynvaan, W. Konrad**, "Experimental verification of automated loss-simulation of magnetic components," poster, *Power Electronics for Energy Transition Symposium* (AIT & SAL), Vienna, Austria, Sep. 29–30, 2026. Silicon Austria Labs, with Infineon Technologies AG.
   Record: [SAL research portal – CEMC group](https://silicon-austria-labs.elsevierpure.com/en/organisations/coexistence-electromagnetic-compatibility-cemc/) · Event: [IEEE Austria listing](https://www.ieee-austria.org/event-details.php?id=322), [b2match page](https://www.b2match.com/e/power-electronics-for-energy-transition-2026)
2. **J. Reynvaan, M. Pajnić, J. Krenn**, "Evaluating fluid based transient calorimetric method for measurement of the ferrite core losses," in *Proc. 11th Int. Conf. Power Electronics – ECCE Asia (ICPE 2023-ECCE Asia)*, Jeju, Korea, 2023, pp. 3308–3313.
   *Relevance:* the same SAL group's evaluation of a stirred, adiabatic, fluid-based transient calorimeter (stirring speed, specific heat of ferrite samples, DC-injection calibration). This is the method behind the poster's measurement. [Author page](https://silicon-austria-labs.elsevierpure.com/en/persons/jacob-reynvaan-4)

*Related activity:* an SAL team (M. Stoiber, J. Reynvaan, C. Gei, Z. Huang, W. Konrad, R. Petrella) won 3rd place in the Innovation Track of the **MagNet Challenge 2** (24 Mar 2026), a data-driven core-loss modelling competition. [Challenge repository](https://github.com/minjiechen/magnetchallenge-2)

## B. Calorimetric loss measurement

3. **P. Papamanolis, T. Guillod, F. Krismer, J. W. Kolar**, "Transient calorimetric measurement of ferrite core losses up to 50 MHz," *IEEE Trans. Power Electron.*, vol. 36, no. 3, pp. 2548–2563, 2021. [IEEE Xplore](https://ieeexplore.ieee.org/document/9169835/) · [accepted version (PDF)](https://www.ams-publications.ee.ethz.ch/uploads/tx_ethpublications/12_Transient_Calorimetric_Papamanolis-TPEL_ACCEPTED-VERSION.pdf) · conference version: [APEC 2020 (PDF)](https://www.ams-publications.ee.ethz.ch/uploads/tx_ethpublications/7_APEC2020_Transient-Calorimetric-Measurement-of-Ferrite-Core-Losses_FINAL_Papamanolis_01.pdf)
   *Relevance:* the closest published method. Loss is taken from the transient temperature slope times the heat capacity, which is independent of excitation and frequency.
4. **D. Christen, U. Badstuebner, J. Biela, J. W. Kolar**, "Calorimetric power loss measurement for highly efficient converters," in *Proc. IPEC 2010 (ECCE Asia)*, Sapporo, Japan, 2010, pp. 1438–1445. DOI: [10.1109/IPEC.2010.5544503](https://doi.org/10.1109/IPEC.2010.5544503) · [PDF](https://www.ams-publications.ee.ethz.ch/uploads/tx_ethpublications/IPEC_2010_Badstuebner.pdf)
   *Relevance:* a double-jacketed, closed-type steady-state calorimeter for converter losses. It contrasts with the poster's transient method, which needs no coolant flow measurement.
5. **S. Weier, M. A. Shafi, R. McMahon**, "Precision calorimetry for the accurate measurement of losses in power electronic devices," *IEEE Trans. Ind. Appl.*, vol. 46, no. 1, pp. 278–284, 2010. [ResearchGate](https://www.researchgate.net/publication/224083614_Precision_Calorimetry_for_the_Accurate_Measurement_of_Losses_in_Power_Electronic_Devices)
6. **C. Xiao, G. Chen, W. G. H. Odendaal**, "Overview of power loss measurement techniques in power electronics systems," *IEEE Trans. Ind. Appl.*, vol. 43, no. 3, pp. 657–664, 2007. [ResearchGate](https://www.researchgate.net/publication/3173215_Overview_of_Power_Loss_Measurement_Techniques_in_Power_Electronics_Systems)
   *Relevance:* compares electrical and calorimetric methods and explains why phase errors limit V·I measurements.
7. **D. Rothmund, D. Bortis, J. W. Kolar**, "Accurate transient calorimetric measurement of soft-switching losses of 10-kV SiC MOSFETs and diodes," *IEEE Trans. Power Electron.*, vol. 33, no. 6, pp. 5240–5250, 2018. DOI: [10.1109/TPEL.2017.2729892](https://doi.org/10.1109/TPEL.2017.2729892)
   *Relevance:* the same transient ΔT/Δt principle applied to switching losses.
8. **L. Zhu, Z. Liu, Y. Dang, S. Zhang, G. Zhang, S. Ji**, "A review of power loss measurement method for high-frequency transformer," *Renewable Energy System and Equipment*, 2026. DOI: [10.1016/j.rese.2026.05.002](https://doi.org/10.1016/j.rese.2026.05.002)
   *Relevance:* a recent review of electrical and calorimetric methods for measuring core, winding and total loss.

## C. Loss modelling of windings and cores

9. **P. L. Dowell**, "Effects of eddy currents in transformer windings," *Proc. IEE*, vol. 113, no. 8, pp. 1387–1394, 1966. DOI: [10.1049/piee.1966.0236](https://doi.org/10.1049/piee.1966.0236)
10. **W. G. Hurley, E. Gath, J. G. Breslin**, "Optimizing the AC resistance of multilayer transformer windings with arbitrary current waveforms," *IEEE Trans. Power Electron.*, vol. 15, no. 2, pp. 369–376, 2000. DOI: [10.1109/63.838110](https://doi.org/10.1109/63.838110)
    *Relevance:* computes winding loss for non-sinusoidal currents harmonic by harmonic. This is the basis for the poster's FFT step and its 10 dominant components.
11. **C. R. Sullivan**, "Optimal choice for number of strands in a litz-wire transformer winding," *IEEE Trans. Power Electron.*, vol. 14, no. 2, pp. 283–291, 1999. [PDF](https://www.wcmagnetics.com/wp-content/uploads/2015/02/numberofstrands.pdf)
12. **R. P. Wojda, M. K. Kazimierczuk**, "Winding resistance and power loss of inductors with litz and solid-round wires," *IEEE Trans. Ind. Appl.*, vol. 54, no. 4, pp. 3548–3557, 2018. DOI: [10.1109/TIA.2018.2821647](https://doi.org/10.1109/TIA.2018.2821647)
    *Relevance:* compares solid and litz windings directly, which is the core of the poster's result.
13. **W. A. Roshen**, "Fringing field formulas and winding loss due to an air gap," *IEEE Trans. Magn.*, vol. 43, no. 8, pp. 3387–3394, 2007. DOI: [10.1109/TMAG.2007.898908](https://doi.org/10.1109/TMAG.2007.898908)
14. **T. Ewald, J. Biela**, "Analytical winding loss and inductance models for gapped inductors with litz or solid wires," *IEEE Trans. Power Electron.*, vol. 37, pp. 15127–15139, 2022. [Semantic Scholar](https://www.semanticscholar.org/paper/Analytical-Winding-Loss-and-Inductance-Models-for-Ewald-Biela/02ca895720d48f6a9aa638936d064823531eb3a6)
    *Relevance:* [13] and [14] describe air-gap fringing losses, which hit solid conductors hardest. They are a likely place to look for the solid-wire discrepancy.
15. **K. Venkatachalam, C. R. Sullivan, T. Abdallah, H. Tacca**, "Accurate prediction of ferrite core loss with nonsinusoidal waveforms using only Steinmetz parameters," in *Proc. IEEE COMPEL*, 2002, pp. 36–41. [ResearchGate](https://www.researchgate.net/publication/4014009_Accurate_prediction_of_ferrite_core_loss_with_nonsinusoidal_waveforms_using_only_Steinmetz_parameters)
16. **J. Mühlethaler, J. Biela, J. W. Kolar, A. Ecklebe**, "Improved core-loss calculation for magnetic components employed in power electronic systems," *IEEE Trans. Power Electron.*, vol. 27, no. 2, pp. 964–973, 2012. DOI: [10.1109/TPEL.2011.2162252](https://doi.org/10.1109/TPEL.2011.2162252)
    *Relevance:* [15] (iGSE) and [16] (i²GSE) are time-domain core-loss models. They are the usual alternative to adding up core loss harmonic by harmonic.

## D. Automated / integrated simulation and design workflows

17. **N. Förster, T. Piepenbrock, P. Rehlaender, O. Wallscheid, F. Schafmeister, J. Böcker**, "An open-source FEM magnetics toolbox for power electronic magnetic components," in *Proc. PCIM Europe*, Nuremberg, Germany, 2022. [VDE](https://www.vde-verlag.de/proceedings-en/565822103.html) · [code (FEMMT, Python)](https://github.com/upb-lea/FEM_Magnetics_Toolbox)
    *Relevance:* an open-source Python counterpart to the poster's scripted FEM step.
18. **N. Djekanovic, M. Luo, D. Dujic**, "Integrated simulation approach to loss calculations of power converter systems," in *Proc. PCIM Europe digital days*, 2020, pp. 418–425. [IEEE Xplore](https://ieeexplore.ieee.org/document/9178031/)
    *Relevance:* computes semiconductor and magnetic losses together in PLECS and checks them against a 100 kW, 10 kHz transformer.
19. **T. Guillod, P. Papamanolis, J. W. Kolar**, "Artificial neural network (ANN) based fast and accurate inductor modeling and design," *IEEE Open J. Power Electron.*, vol. 1, pp. 284–299, 2020. [PDF](https://www.ams-publications.ee.ethz.ch/uploads/tx_ethpublications/13_paper_ANN_guillod_ACCEPTED-VERSION.pdf)
    *Relevance:* uses FEM-trained neural networks for automated inductor design, applied to a buck-converter inductor.
20. **H. Li, D. Serrano, T. Guillod, S. Wang, E. Dogariu, A. Nadler, M. Luo, V. Bansal, N. K. Jha, Y. Chen, C. R. Sullivan, M. Chen**, "How MagNet: Machine learning framework for modeling power magnetic material characteristics," *IEEE Trans. Power Electron.*, vol. 38, no. 12, pp. 15829–15853, 2023. [Princeton](https://collaborate.princeton.edu/en/publications/how-magnet-machine-learning-framework-for-modeling-power-magnetic/) · [code](https://github.com/PrincetonUniversity/magnet)
